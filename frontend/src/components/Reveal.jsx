import { useReveal } from '../hooks/useReveal';

// Wraps an element (default <div>, pass `as` for a specific tag) so it
// fades/slides in the first time it scrolls into view. Purely additive —
// same tag, same className plus the reveal state, no change to what's
// rendered inside.
export function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const [ref, visible] = useReveal();
  const classes = `reveal${visible ? ' reveal--visible' : ''}${className ? ` ${className}` : ''}`;
  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  );
}
