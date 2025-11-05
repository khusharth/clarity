# Accessibility Requirements for Modal Component

## Core Requirements

1. **Keyboard Navigation**
   - Focus trap within modal when open
   - Escape key to close
   - Focus returns to trigger element on close
   - Initial focus on first input when specified via initialFocusRef

2. **Screen Reader Support**
   - Modal announces its title via aria-labelledby
   - Modal announces its description via aria-describedby
   - Uses dialog role from Radix UI Dialog
   - Clear open/close announcements

3. **Motion & Animation**
   - Respects prefers-reduced-motion
   - Uses global animation toggle from Settings
   - Animation duration: 150-250ms per constitution
   - Simple fade/scale for reduced motion users

4. **Mobile & Touch**
   - Bottom sheet accessible via touch on mobile
   - 120px drag threshold for dismissal
   - Clear visual feedback during drag
   - Alternative close methods (overlay/button) always available

## Implementation Notes

- Using Radix UI Dialog for core a11y features
- All interactive elements must be keyboard accessible
- Color contrast meets WCAG AA requirements using CSS variables
- Animations are subtle and never block interaction