/** Usage guidelines per component, shown from the "View guidelines" button on each component page.
 *  Sources are named in each entry. Accessibility calls cite WCAG 2.2 success criteria. */
export interface GuidelineTable { head: string[]; rows: string[][] }
/** One numbered anatomy part. For diagram 'live', selector finds the part inside the rendered story (querySelector from the story root;
 *  '' means the root element) and side is where the numbered callout sits. A part without a selector is listed but not drawn. */
export interface AnatomyPart { name: string; text: string; selector?: string; side?: 'top' | 'bottom' | 'left' | 'right' }
export interface GuidelineSection {
  title: string
  intro: string
  bullets?: string[]
  /** Labeled bullet groups, e.g. Do and Don't. */
  groups?: Array<{ label: string; bullets: string[] }>
  table?: GuidelineTable
  note?: { label: string; text: string }
  props?: string[]
  /** Anatomy: a diagram key (see AnatomyDiagram) and the numbered parts, in callout order. */
  anatomy?: { diagram: string; /** Story export key to draw (live-diagram only). Defaults to the first story. */ story?: string; parts: AnatomyPart[] }
}
/** summary: always-visible purpose shown above the sections. Plain language, based on usage and why the choices were made. */
export interface Guidelines { summary: string; /** Extra purpose context: who uses it and what for. */ usedFor?: string; /** Why the component works the way it does. */ why?: string; sections: GuidelineSection[] }

import { BATCH_GUIDELINES } from './guidelines/index'

const BUTTON: Record<string, Guidelines> = {
  Button: {
    summary: 'A button is how someone tells the product to do something, like save, create, or delete. We give buttons a few levels of importance so people can see the main action right away and are never unsure what a click will do. Buttons that do things look different from links that go places, so nobody is surprised.',
    usedFor: 'Saving work, creating things, submitting forms, confirming choices, opening dialogs and menus, and removing things.',
    why: 'Importance levels (primary, secondary, tertiary, destructive) guide the eye to the main action. Destructive actions are red so they are not clicked by accident. Disabled buttons stay focusable and explain themselves, so nobody is left guessing.',
    sections: [
      { title: 'When to use', intro: 'A button is how someone makes something happen. If pressing it does something, it is a button.',
        bullets: ['To save, create, apply, or confirm something.', 'To submit a form or move a flow forward.', 'To open a dialog or menu that acts on what is on screen.', 'Use the destructive style only when the action cannot be undone, such as delete, remove, or revoke.'] },
      { title: 'When not to use', intro: 'Buttons do things and links go places. Mixing them up confuses people about what will happen.',
        bullets: ['To go to another page or view. Use Link.', 'For a setting that takes effect right away with no save step. Use Toggle.', 'To switch between views of the same content. Use Tabs or Button Group.', 'For labels or status. Badges and Chips must never look like buttons.'] },
      { title: 'Anatomy', intro: 'Every button is built from the same few parts, so they look and behave the same everywhere.',
        anatomy: { diagram: 'button', parts: [
          { name: 'Container', text: '12px radius and a 1px stroke. Fill and border change with priority. Pills are reserved for badges and chips.' },
          { name: 'Label', text: 'Verb plus noun in Medium (500) weight. Replaced by a spinner while loading, and the width stays fixed.' },
          { name: 'Leading icon', text: 'Optional. Reinforces the label and never replaces it, except in icon-only buttons, which need an accessible name.' },
          { name: 'Trailing icon', text: 'Optional. Signals what happens next, such as a menu opening. Hidden in icon-only buttons.' },
          { name: 'Focus ring', text: 'A 2px white gap plus a Blue 600 ring, drawn outside the container and identical on every priority.' }] },
        props: ['priority', 'size', 'iconOnly', 'loading', 'disabled', 'unavailableReason'] },
      { title: 'Choosing a priority and size', intro: 'Priority tells people which action matters most. One loud button keeps the screen easy to scan.',
        table: { head: ['Priority', 'Use for', 'Limit'], rows: [['Primary', 'The main action', 'One per task area'], ['Secondary', 'Cancel, back, edit', 'One per group'], ['Tertiary', 'View details, learn more, optional', 'Most common tier'], ['Destructive', 'Irreversible removal', 'Confirm in a dialog']] },
        note: { label: 'Size', text: 'Small for dense areas like table rows. Medium is the default. Large for prominent calls to action and onboarding.' } },
      { title: 'Best practices', intro: 'These habits keep buttons predictable, so people never have to stop and wonder what one will do.',
        groups: [
          { label: 'Do', bullets: ['Use one primary button per task area.', 'Use a verb plus a noun: "Save Changes", "Create Segment".', 'In a group of three, use all three priority levels.', 'Pick left or right alignment once and keep it everywhere.', 'Show loading during async work so the layout does not jump.', 'Use icon-only buttons only for icons everyone knows, and always label them.'] },
          { label: "Don't", bullets: ['Use "OK", "Yes", or "Submit" as labels.', 'Make a primary button icon-only. It falls back to secondary.', 'Leave a button disabled without saying why. Set unavailableReason.', 'Add a tooltip to rescue an unclear label. Rewrite the label.', 'Style other elements to look like buttons.'] }] },
      { title: 'Content guidelines', intro: 'Good button text says exactly what will happen, in as few words as possible.',
        bullets: ['Verb plus noun, as short as possible.', 'In dialogs, the action mirrors the title: "Delete segment?" gets "Delete Segment" and "Cancel".', 'Disabled reasons say what to do next: "Add at least one account to continue."', 'Destructive buttons name the thing being removed.'] },
      { title: 'Accessibility (WCAG 2.2)', intro: '',
        table: { head: ['Requirement', 'WCAG', 'How Button meets it'], rows: [
          ['Name, role, value', '4.1.2', 'Native button element. Icon-only needs aria-label.'],
          ['Keyboard', '2.1.1', 'Tab to focus. Enter or Space to activate.'],
          ['Visible focus', '2.4.7', 'Same focus ring on every priority and theme.'],
          ['Target size', '2.5.8', 'Hit area of at least 44×44 px, with 8px between targets.'],
          ['Text contrast', '1.4.3', 'Primary 5.8–6.8:1. Secondary and tertiary about 7.3:1. Disabled text is exempt.'],
          ['Disabled and loading', '3.3.2, 4.1.2', 'aria-disabled, a reason linked with aria-describedby, and aria-busy while loading. Disabled buttons stay focusable.'],
          ['Status messages', '4.1.3', 'The spinner has the accessible label "Loading".']] },
        note: { label: 'Accepted trade-off: 1.4.11 Non-text contrast', text: 'Secondary and tertiary fills and borders measure about 1.0–1.6:1 against the page, under the 3:1 minimum. Shape, depth cues, and directive copy carry identification (visual-design-decisions.md §4.3). Icon-only tertiary is an open risk and needs an aria-label and a tap-target check.' } },
      { title: 'Related components', intro: 'If a button is not quite right, one of these probably is.',
        bullets: ['Link: going to another page.', 'Button Group: a set of related actions.', 'Split Button: a main action with alternates.', 'Menu: overflow actions.', 'Toggle: instant settings.', 'Dialog: confirming destructive actions.'] },
    ],
  },
}

export const GUIDELINES: Record<string, Guidelines> = { ...BUTTON, ...BATCH_GUIDELINES }
