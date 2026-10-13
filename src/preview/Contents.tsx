import { Card } from '../components/Card'

type Item = [string, string, string?] // name, description, link (hash)
const c = (f: string) => `#/c/${f}`
// The sample is one self-contained HTML file. The link always goes to the GitHub copy on main, rendered through htmlpreview,
// so it is the same address whether the preview is opened locally or from GitHub.
const REPO = 'jstagge-6sense/Claude-design-system---POC'
const sample = (path: string) => `https://htmlpreview.github.io/?https://github.com/${REPO}/blob/main/${encodeURI(path)}`
const REVVY_SAMPLE = 'Product libraries/Intelligence library/samples/revvy-explainability/revvy-explainability.html'
const SECTIONS: Array<{ title: string; about: string; items: Item[]; link?: { label: string; path: string } }> = [
  { title: 'Action', about: 'Things people click or tap to make something happen.', items: [
    ['Button', 'The main way to do something, like Save or Create.', c('Button')],
    ['Icon button', 'A button with only an icon, for tight spaces like tables and cards.'],
    ['Button group', 'A row of related buttons kept together.', c('ButtonGroup')],
    ['Split button', 'A button with a small menu for related choices.', c('SplitButton')],
    ['Link', 'Text that takes you to another page.', c('Link')],
    ['Menu', 'A list of choices that opens from a button.', c('Menu')],
  ] },
  { title: 'Data entry', about: 'Fields and controls where people type, pick or switch things.', items: [
    ['Input', 'A box for typing a short line of text.', c('Input')],
    ['Text area', 'A larger box for longer text.', c('TextArea')],
    ['Number input', 'A box for numbers, with plus and minus buttons.', c('NumberInput')],
    ['Search', 'A box for finding things.', c('Search')],
    ['Select', 'Pick one option from a list.', c('Select')],
    ['Multi select', 'Pick several options from a list.', c('MultiSelect')],
    ['Checkbox', 'A box to tick on or off, for one or many choices.', c('Checkbox')],
    ['Radio', 'Pick exactly one option from a short set.', c('Radio')],
    ['Toggle', 'An on and off switch.', c('Toggle')],
    ['Slider', 'Drag a handle to choose a value in a range.', c('Slider')],
    ['Date picker', 'Choose a date from a calendar.', c('DatePicker')],
    ['Time picker', 'Choose a time of day.', c('TimePicker')],
    ['File upload', 'Add files by dragging them in or browsing.', c('FileUpload')],
    ['Wysiwyg toolbar', 'Buttons for formatting text, like bold and lists.', c('WysiwygToolbar')],
  ] },
  { title: 'Navigation and structure', about: 'Help people find their way around and organize a page.', items: [
    ['Top bar', 'The bar across the top of the app with logo, menu, search and profile.', c('TopBar')],
    ['Nav', 'The side menu for moving between areas of the app.', c('Nav')],
    ['Page header', 'The title area at the top of a page, with actions.', c('PageHeader')],
    ['Breadcrumb', 'A trail showing where you are, with links back.', c('Breadcrumb')],
    ['Tabs', 'Switch between views on the same page.', c('Tabs')],
    ['Pagination', 'Move between pages of results.', c('Pagination')],
    ['Progress steps', 'Shows the steps of a process and where you are.', c('ProgressSteps')],
    ['Table', 'Rows and columns of data.', c('Table')],
    ['Data metric', 'A single number with a label, like a key stat.', c('DataMetric')],
    ['Divider', 'A thin line that separates content.', c('Divider')],
  ] },
  { title: 'Container', about: 'Boxes and panels that hold other content.', items: [
    ['Card', 'A box that groups related information.', c('Card')],
    ['Accordion', 'Sections that open and close to show more.', c('Accordion')],
    ['Dialog', 'A window that appears on top to ask or tell something.', c('Dialog')],
    ['Feedback modal', 'A window for collecting feedback from the person using the product.'],
    ['Drawer', 'A panel that slides in from the edge.', c('Drawer')],
    ['Side panel', 'A panel that sits beside the page for extra details.', c('SidePanel')],
    ['Popover', 'A small pop-up note that appears next to something.', c('Popover')],
    ['Code snippet', 'A box showing code that can be copied.', c('CodeSnippet')],
  ] },
  { title: 'Feedback and status', about: 'Tell people what is happening or what state something is in.', items: [
    ['Banner', 'A message across the top of a page or section.', c('Banner')],
    ['Toast', 'A short message that appears briefly, then goes away.', c('Toast')],
    ['Badge', 'A small label showing a status or a count.', c('Badge')],
    ['Category badge', 'A small label that names a type or feature, kept separate from status badges.'],
    ['Chip', 'A small tag that can be picked or removed.', c('Chip')],
    ['Avatar', 'A picture or initials that represent a person.', c('Avatar')],
    ['Empty state', 'What people see when there is nothing to show yet.', c('EmptyState')],
    ['Spinner', 'A small circle that shows something is loading.', c('Spinner')],
    ['Progress bar', 'A bar that shows how far along something is.', c('ProgressBar')],
    ['Progress circle', 'A ring that shows how far along something is.', c('ProgressCircle')],
    ['Skeleton loader', 'A grey outline of the page while it loads.', c('SkeletonLoader')],
  ] },
  { title: 'Patterns', about: 'Ready-made combinations and helpers for common needs.', items: [
    ['Form group', 'Fields grouped together as one part of a form.', c('FormGroup')],
    ['Data table toolbar', 'The search, filter and action bar above a table.', c('DataTableToolbar')],
    ['Infinite scroll', 'Loads more items as you scroll down.', c('InfiniteScroll')],
    ['Sticky', 'Keeps something in view while the page scrolls.', c('Sticky')],
    ['Truncate', 'Shortens long text and shows the rest on request.', c('Truncate')],
  ] },
  { title: 'Revvy and explainability', about: 'Pieces of the Revvy AI assistant and the explanations it gives. These live in product code, not in this repo yet.', link: { label: 'Open the Revvy explainability sample', path: REVVY_SAMPLE }, items: [
    ['Revvy chat', 'The conversation window with the AI assistant.'],
    ['Revvy library', 'Saved prompts and answers people can reuse.'],
    ['Revvy history', 'Past conversations people can look back at.'],
    ['Model blocks', 'Blocks that show how the AI reached an answer, step by step.'],
    ['Markdown', 'Formats the assistant\'s written answers with headings, lists and links.'],
    ['AI reaction', 'Thumbs up or down on an AI answer.'],
    ['Reaction modal', 'The follow-up window that asks why someone reacted that way.'],
  ] },
  { title: 'Data visualization', about: 'Charts that turn numbers into pictures.', items: [
    ['DBA chart', 'The shared base that every chart below is built on.'],
    ['Area chart', 'A line with the space below it filled in.', '#/d/area'],
    ['Line chart', 'Shows how a number changes over time.', '#/d/line'],
    ['Bar chart', 'Compares amounts side by side.', '#/d/bar'],
    ['Stacked and grouped bar chart', 'Bars split into parts, or placed in groups.', '#/d/stacked'],
    ['Donut chart', 'A ring split into shares of a whole.', '#/d/donut'],
    ['Funnel chart', 'Shows how many drop off at each step.', '#/d/funnel'],
    ['Pareto chart', 'Bars sorted largest first, with a running total line.', '#/d/pareto'],
  ] },
  { title: 'Building blocks', about: 'Small pieces used inside other components.', items: [
    ['Icon', 'The small pictures used across the library.'],
    ['Portal', 'Lets a pop-up appear on top of everything else.'],
    ['Visually hidden', 'Text that only screen readers read.'],
    ['Label', 'The text that names a field.'],
    ['Helper text', 'Short guidance under a field.'],
    ['Body', 'The standard paragraph text.'],
    ['Header', 'The top area of a page or panel.'],
    ['Footer', 'The bottom area of a page or panel.'],
    ['Custom scroll', 'The styled scroll bars.'],
  ] },
]

export function ContentsPage() {
  const total = SECTIONS.reduce((a, s) => a + s.items.length, 0)
  return (
    <>
      <section className="pv-section" data-nav-skip>
        <h2>Table of contents</h2>
        <p className="pv-muted">All {total} items in the library, by section, with a short plain description of each. Select a name to open it.</p>
      </section>
      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr' }}>
        {SECTIONS.map((s) => (
          <div key={s.title} data-nav={s.title} data-count={s.items.length}>
            <Card compact title={<>{s.title} <span className="pv-muted" style={{ fontWeight: 400 }}>({s.items.length})</span></>} subtitle={<>{s.about}{s.link ? <> <a href={sample(s.link.path)} target="_blank" rel="noreferrer">{s.link.label}</a></> : null}</>} headingLevel={2}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                {s.items.map(([name, desc, href]) => (
                  <li key={name}>
                    <strong>{href ? <a href={href}>{name}</a> : name}</strong>
                    <br />
                    <em className="pv-muted">{desc}</em>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ))}
      </div>
    </>
  )
}
