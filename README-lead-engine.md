# MetroTec Lead Engine WordPress Plugin

## Installation

1. Upload the plugin files to `/wp-content/plugins/metrotec-lead-engine/`
2. Activate the plugin through the WordPress admin
3. Go to "Leads" in the admin menu to configure

## Usage

### Display Lead Form
Use the shortcode anywhere on your site:
```
[metrotec_lead_form]
```

### Shortcode Parameters
- `type="full"` - Full multi-step form (default)
- `type="simple"` - Single step form
- `title="Custom Title"` - Custom form title

### Examples
```
[metrotec_lead_form title="Get Your Free IT Assessment"]
[metrotec_lead_form type="simple" title="Quick Contact"]
```

## Features

### Lead Scoring Algorithm
- **Industry Weight**: Healthcare, Manufacturing, Finance = +20 points
- **Company Size**: 1-10 employees = +10, 100+ = +30 points  
- **Budget Range**: Under $1K = +5, $10K+ = +40 points
- **Timeline Urgency**: ASAP = +30, Planning = +5 points
- **Pain Points**: Security/Downtime/Compliance = +10 each

### Lead Statuses
- **New** - Just submitted
- **Contacted** - Initial contact made
- **Qualified** - Meets criteria for services
- **Proposal** - Proposal sent
- **Closed Won** - Converted to customer
- **Closed Lost** - Did not convert

### Analytics Tracking
- Lead volume by month
- Industry breakdown
- Source attribution
- Conversion rates
- Lead score distribution

## Integration

### CRM Integration
The plugin stores leads in WordPress database but can integrate with:
- HubSpot (via API)
- Salesforce (via API)
- Pipedrive (via webhook)

### Email Marketing
Automatically adds leads to:
- Mailchimp lists
- Constant Contact
- ActiveCampaign

### Tracking Integration
- Google Analytics 4 events
- Facebook Pixel conversion tracking
- Custom tracking callbacks

## Customization

### Form Fields
Edit `metrotec-lead-engine.php` to modify form fields in the `lead_form_shortcode()` method.

### Scoring Logic
Modify the `calculate_lead_score()` method to adjust scoring criteria.

### Email Templates
Customize notification emails in the `send_lead_notification()` method.

## Database Schema

The plugin creates a `wp_metrotec_leads` table with these fields:
- `id` - Auto-increment primary key
- `business_name` - Company name
- `contact_name` - Contact person
- `email` - Email address
- `phone` - Phone number
- `website` - Company website
- `industry` - Business industry
- `employees` - Company size
- `current_it_setup` - Current IT description
- `pain_points` - Business challenges
- `budget_range` - Monthly IT budget
- `timeline` - Implementation timeline
- `lead_score` - Calculated score (0-100)
- `lead_source` - Traffic source
- `status` - Lead status
- `created_at` - Submission timestamp
- `updated_at` - Last modified timestamp

## Security Features

- CSRF protection with WordPress nonces
- Input sanitization and validation
- SQL injection prevention
- XSS protection
- Rate limiting (prevents spam)

## Performance

- AJAX form submission (no page reload)
- Form data auto-save to localStorage
- Optimized database queries
- Minimal JavaScript footprint
- Mobile-responsive design

## Support

For technical support or customization requests, contact MetroTec development team.
