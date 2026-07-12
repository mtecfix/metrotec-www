# MetroTec Blog - Newspaper Layout System

## Overview
The MetroTec blog features a newspaper-inspired design with 6 distinct layouts randomly distributed across 44 blog posts.

## Layout Compositions

### Layout 1: Classic Two-Column
- **Typography**: Playfair Display (headlines) + Merriweather (body)
- **Structure**: Traditional 2-column newspaper layout
- **Features**: Simple masthead, responsive columns
- **Usage**: 10 posts

### Layout 2: Sidebar Edition
- **Typography**: Playfair Display + Lora
- **Structure**: Main content with floating sidebar
- **Features**: Bold masthead, quick facts sidebar, purple accent border
- **Usage**: 7 posts

### Layout 3: Three-Column Broadsheet
- **Typography**: Libre Baskerville + Crimson Text
- **Structure**: 3-column layout (responsive to 2/1 columns)
- **Features**: Dark banner, centered headline, maximum readability
- **Usage**: 6 posts

### Layout 4: Premium Paper
- **Typography**: Playfair Display + Source Serif Pro
- **Structure**: Single column with shadow box
- **Features**: Elevated design, white paper on gray background, top/bottom borders
- **Usage**: 4 posts

### Layout 5: Grid Layout
- **Typography**: Playfair Display + Spectral
- **Structure**: 2-column grid (main + sidebar)
- **Features**: Full masthead, related topics sidebar, modern grid system
- **Usage**: 6 posts

### Layout 6: Top Bar Edition
- **Typography**: Playfair Display + PT Serif
- **Structure**: 2-column justified text
- **Features**: Purple top bar, large bold masthead, justified columns
- **Usage**: 11 posts

## Design Principles

### Typography Hierarchy
- **Mastheads**: 2.5rem - 3rem (Playfair Display, weight 900)
- **Headlines**: 2rem - 2.5rem (Playfair Display, weight 700)
- **Body**: 1.05rem - 1.1rem (Serif fonts, line-height 1.8-1.9)

### Color Scheme
- **Primary**: #1a1a1a (black)
- **Accent**: #7c3aed (purple)
- **Background**: #fff / #f9f9f9
- **Text**: #000 / #2d2d2d

### Responsive Breakpoints
- **Desktop**: 3 columns → 2 columns
- **Tablet** (1024px): 2 columns
- **Mobile** (768px): 1 column
- **Small** (640px): Single column, reduced font sizes

## File Structure
```
/blog/
├── README.md (this file)
├── active-directory-security.html
├── aws-vs-azure.html
├── backup-strategy-guide.html
└── ... (44 total posts)
```

## Index Page
- **File**: `/blog.html`
- **Design**: Newspaper masthead + featured article + 3-column grid
- **Typography**: Playfair Display + Inter
- **Features**: Category filters, responsive columns

## Technical Details
- **Total Posts**: 44
- **Layouts**: 6 unique designs
- **Distribution**: Randomized
- **Fonts**: Google Fonts (serif families)
- **Framework**: Minimal CSS, no JavaScript
- **Mobile**: Fully responsive

## Content Strategy
All posts feature:
- Newspaper-style masthead
- Serif typography for readability
- Column-based layouts
- Back navigation link
- Consistent branding

## Future Enhancements
- [ ] Add real blog content
- [ ] Implement category filtering
- [ ] Add author bylines
- [ ] Include publication dates
- [ ] Add social sharing
- [ ] Implement search functionality
