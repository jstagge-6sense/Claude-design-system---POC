# Component Token Naming Conventions

## Structure

`component.{component}.{variant}.{part}.{property}.{state}`

| Segment | Meaning | Example values |
|---|---|---|
| `component` | Fixed root. Marks the tier. | `component` |
| `{component}` | The component that owns the token. | `button`, `toggle`, `splitButton` |
| `{variant}` | The style variant, or `all` when the token applies to every variant. | `primary`, `secondary`, `tertiary`, `destructive`, `all` |
| `{part}` | The piece of the component the token styles. | `container`, `label`, `icon`, `divider` |
| `{property}` | The visual property. One camelCase segment. | `fill`, `border`, `color`, `radius`, `heightSmall` |
| `{state}` | Optional. Always last. | `default`, `hover`, `pressed`, `focus`, `disabled` |

Only the state may be left off, and only at the end. Every other segment is always present, so each position has one meaning.

## Word choice

- **Avoid `standard`.** The semantic files already use it (`border.standard`, `space.standard`). It also implies a non-standard sibling.
- **Use `all`.** It says plainly that the token applies to every variant. `base` is the alternative, but it suggests that variants override it, and that isn't how these tokens behave.
- **Skip `default` for anything but a state.** It collides with the `default` state.

## Rules

- **No implicit fallback.** An `all` token applies to every variant. If one variant later needs its own value, delete the `all` token and make one per variant. Otherwise a person can't tell which token wins.
- **Always include the part.** One-part components like Toggle use `container`. Dropping the part would bring back the shifting-position problem.
- **Keep size out of the state slot.** `component.button.all.container.height.small` puts `small` where a state goes. Fold size into the property instead: `heightSmall`, `heightMedium`. This is a small mismatch with the semantic name (`control.height.small`), but it keeps the last slot for states only.

## Examples

| Token | Points to |
|---|---|
| `component.button.all.container.radius` | `{core.dimension.radius.control.medium}` |
| `component.button.all.container.heightSmall` | `{core.dimension.size.control.height.small}` |
| `component.button.all.container.fill.disabled` | `{core.color.action.disabled.fill}` |
| `component.button.primary.container.fill.hover` | `{core.color.action.primary.hover}` |
| `component.button.primary.label.color.default` | `{core.color.content.inverse}` |
| `component.button.primary.container.insetTopLeft.hover` | `{core.color.teal.100}` |
