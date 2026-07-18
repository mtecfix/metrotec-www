#!/usr/bin/env python3
"""
wire-newsletter-forms.py

Wires the existing mobile newsletter signup forms to the /subscribe API.
For each m/*.html page that contains a newsletter form:
  1. Tag the <form ... aria-label="Newsletter signup"> with class "nl-form"
     and remove the inert onsubmit="return false;".
  2. Inject a hidden honeypot input (company_website) into the form.
  3. Inject a shared <script> (once) before </body> that POSTs to /subscribe.

Idempotent: skips a page if the handler script is already present.
Run with --dry-run to preview.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
M_DIR = os.path.join(ROOT, "m")
DRY = "--dry-run" in sys.argv

API = "https://sebm7k9d9c.execute-api.us-east-1.amazonaws.com/subscribe"

HANDLER = """
<script id="nl-subscribe-script">
(function(){
  var API_URL="%s";
  function wire(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var hp=form.querySelector('input[name="company_website"]');
      var emailInput=form.querySelector('input[type="email"]');
      var btn=form.querySelector('button[type="submit"]');
      var email=emailInput?emailInput.value.trim():"";
      var msg=form.querySelector(".nl-msg");
      if(!msg){msg=document.createElement("p");msg.className="nl-msg";msg.style.fontSize="0.8rem";msg.style.marginTop="0.5rem";form.appendChild(msg);}
      if(btn){btn.disabled=true;}
      fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email,source:location.pathname,company_website:hp?hp.value:""})})
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.ok){msg.style.color="#a7f3d0";msg.textContent="Thanks — you're subscribed!";form.reset();}
        else{msg.style.color="#fecaca";msg.textContent=(d.error||"Something went wrong. Please try again.");}
      })
      .catch(function(){msg.style.color="#fecaca";msg.textContent="Network error. Please try again.";})
      .finally(function(){if(btn){btn.disabled=false;}});
    });
  }
  var forms=document.querySelectorAll("form.nl-form");
  Array.prototype.forEach.call(forms,wire);
})();
</script>
""" % API

HONEYPOT = ('<input type="text" name="company_website" tabindex="-1" autocomplete="off" '
            'aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;">')

FORM_RE = re.compile(r'<form([^>]*?)aria-label="Newsletter signup"([^>]*)>', re.I)


def process(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()
    if 'id="nl-subscribe-script"' in text:
        return False, "already wired"
    if 'aria-label="Newsletter signup"' not in text:
        return False, "no newsletter form"

    original = text

    # 1. tag form with class nl-form, drop inert onsubmit
    def repl(m):
        pre, post = m.group(1), m.group(2)
        attrs = (pre + post)
        attrs = attrs.replace('onsubmit="return false;"', "")
        # add class
        if 'class="' in attrs:
            attrs = re.sub(r'class="([^"]*)"', lambda mm: 'class="%s nl-form"' % mm.group(1), attrs, count=1)
        else:
            attrs = attrs + ' class="nl-form"'
        return "<form" + attrs + ">"
    text = FORM_RE.sub(repl, text, count=1)

    # 2. Inject honeypot ONLY inside the newsletter form. Locate the nl-form
    #    opening tag, then insert the honeypot before the first </form> that
    #    follows it (scoped to that form, not any other submit button).
    nl_idx = text.find("nl-form")
    if nl_idx != -1:
        form_end = text.find("</form>", nl_idx)
        if form_end != -1:
            text = text[:form_end] + HONEYPOT + text[form_end:]

    # 3. inject handler before </body>
    text = text.replace("</body>", HANDLER + "\n</body>", 1)

    if text == original:
        return False, "no change"
    if not DRY:
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)
    return True, "wired"


def main():
    changed = 0
    skipped = []
    for fn in sorted(os.listdir(M_DIR)):
        if not fn.endswith(".html"):
            continue
        path = os.path.join(M_DIR, fn)
        ok, why = process(path)
        if ok:
            changed += 1
        else:
            skipped.append((fn, why))
    print(("DRY RUN " if DRY else "") + "wired %d pages" % changed)
    for fn, why in skipped:
        if why != "no newsletter form":
            print("  skip %s: %s" % (fn, why))


if __name__ == "__main__":
    main()
