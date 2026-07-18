#!/usr/bin/env python3
"""
add-desktop-newsletter.py

Inserts a wired newsletter signup band immediately before the standard
desktop footer on marketing/content pages. Idempotent; --dry-run supported.

Excludes functional/auth/legal pages where a signup band doesn't fit.
"""
import os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DRY = "--dry-run" in sys.argv
API = "https://sebm7k9d9c.execute-api.us-east-1.amazonaws.com/subscribe"

FOOTER_MARKER = '<footer style="background:#0f172a;padding:20px 0;color:rgba(255,255,255,0.7);">'

EXCLUDE = {
    "portal.html", "submit-ticket.html", "get-quote.html",
    "privacy-policy.html", "terms-of-service.html",
}

SECTION = """
  <!-- Newsletter Signup -->
  <section class="nl-band" style="background:linear-gradient(135deg,var(--primary-600,#0284c7) 0%%,var(--primary-700,#0369a1) 100%%);padding:3rem 1.5rem;text-align:center;color:#fff;">
    <div style="max-width:640px;margin:0 auto;">
      <h2 style="font-size:1.75rem;font-weight:800;margin-bottom:0.5rem;color:#fff;">Stay in the Loop</h2>
      <p style="font-size:1.05rem;opacity:0.9;margin-bottom:1.5rem;">Get IT tips, security alerts, and Metro Detroit business insights in your inbox. No spam, unsubscribe anytime.</p>
      <form class="nl-form" aria-label="Newsletter signup" style="display:flex;gap:0.5rem;max-width:480px;margin:0 auto;flex-wrap:wrap;justify-content:center;">
        <input type="email" name="email" placeholder="Your email address" required aria-label="Email address" style="flex:1;min-width:220px;padding:0.85rem 1rem;border:none;border-radius:0.5rem;font-size:1rem;">
        <input type="text" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;">
        <button type="submit" style="background:#fff;color:var(--primary-700,#0369a1);font-weight:700;padding:0.85rem 1.75rem;border:none;border-radius:0.5rem;font-size:1rem;cursor:pointer;">Subscribe</button>
      </form>
      <p class="nl-msg" style="font-size:0.85rem;margin-top:0.75rem;min-height:1rem;"></p>
    </div>
  </section>
"""

HANDLER = """
<script id="nl-subscribe-script">
(function(){
  var API_URL="%s";
  Array.prototype.forEach.call(document.querySelectorAll("form.nl-form"),function(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var hp=form.querySelector('input[name="company_website"]');
      var emailInput=form.querySelector('input[type="email"]');
      var btn=form.querySelector('button[type="submit"]');
      var msg=form.querySelector(".nl-msg")||form.parentNode.querySelector(".nl-msg");
      var email=emailInput?emailInput.value.trim():"";
      if(btn){btn.disabled=true;}
      fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email,source:location.pathname,company_website:hp?hp.value:""})})
      .then(function(r){return r.json();})
      .then(function(d){
        if(msg){ if(d.ok){msg.style.color="#a7f3d0";msg.textContent="Thanks — you're subscribed!";form.reset();}
        else{msg.style.color="#fecaca";msg.textContent=(d.error||"Something went wrong. Please try again.");} }
      })
      .catch(function(){if(msg){msg.style.color="#fecaca";msg.textContent="Network error. Please try again.";}})
      .finally(function(){if(btn){btn.disabled=false;}});
    });
  });
})();
</script>
""" % API


def main():
    changed = 0
    for fn in sorted(os.listdir(ROOT)):
        if not fn.endswith(".html") or fn in EXCLUDE:
            continue
        path = os.path.join(ROOT, fn)
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            text = f.read()
        if FOOTER_MARKER not in text:
            continue
        if 'id="nl-subscribe-script"' in text or 'class="nl-band"' in text:
            continue  # already added
        new = text.replace(FOOTER_MARKER, SECTION + "\n  " + FOOTER_MARKER, 1)
        new = new.replace("</body>", HANDLER + "\n</body>", 1)
        if new != text:
            changed += 1
            if not DRY:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new)
            print(("[dry] " if DRY else "") + "added: " + fn)
    print(("DRY RUN " if DRY else "") + "total pages updated: %d" % changed)


if __name__ == "__main__":
    main()
