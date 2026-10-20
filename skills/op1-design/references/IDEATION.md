# Develop An Original Screen Idea

Use this reference when the user wants to explore a visual direction. The
patterns are starting points for a conversation, not a house style to copy.
Work with the user’s sound, taste and existing ideas. If a direction is already
chosen, develop it rather than restarting the brainstorming.

## Find The Musical Idea

Begin with what the player hears and does. Useful prompts include:

- What changes most clearly when the main control moves?
- Does the sound suggest striking, stretching, folding, scattering, rubbing or
  something less physical? Which of those actually fits the sound model?
- What should be understood at a glance while playing? What needs a precise
  number only during editing?
- Does the user have an object, material, drawing or mood in mind?

Pick the questions that resolve a real uncertainty. Offer a provisional idea
when that helps the conversation; do not turn this into a required questionnaire.
Keep proposed sound features distinct from controls the instrument already has.

## Explore Different Visual Explanations

Try different ways to explain the sound before polishing one layout. A
mechanism might make one instrument easier to understand; a sparse diagram
might suit another. In each, the player should be able to follow a control
change into the picture.

| Musical Relationship | Possible Direction To Explore |
| --- | --- |
| Stored energy and release | An elastic form, a compressed shape or a restrained spring |
| Interaction between voices | Separate bodies approaching, overlapping or exchanging a small pulse |
| Repeated events or echoes | Marks along a path, nested chambers or a pattern with deliberate gaps |
| Brightness, density or texture | Changing spacing, contours or a small family of surface marks |
| Position within a sound | A local window beside the whole, with stable boundary markers |
| A continuous timbral change | A figure whose silhouette or internal proportions explain that change |

Use these ideas when they fit the instrument. A metaphor should help
someone predict the control’s effect without implying a physical simulation or
interaction that does not exist. At intended size, does the drawing read as the
object or relationship you meant? Look for unintended faces, brackets, cursors
or other shapes that suggest a different meaning. Follow the user’s unfamiliar idea when it has
a clearer connection to the instrument than these suggestions.

## Keep The Shared Design Language

The kit’s reading of stock screens suggests useful questions for each concept:

- **One visual idea:** what gives this screen its identity? Can a contour,
  arrangement or relationship do the work of extra labels and decoration?
- **Colour with ownership:** can the player follow each encoder to its value
  and the part it changes, while position and shape provide other clues?
- **Space and hierarchy:** what should the eye find first? Where can the
  picture have space, and where should a value sit?
- **Lettering with a job:** which stock-derived text role fits the reading
  task? Would a large number lead, or would a compact readout support the art?
- **Meaningful response:** what should move, fill or become visible when the
  player acts? What stays fixed so the change can be understood?

These questions come from studying stock screens; they are not official TE rules. Four encoder colours
do not demand four equal panels. An expressive object does not have to resemble
a stock instrument, and a sparse diagram can have as much character as a
physical metaphor. See [Patterns](PATTERNS.md) for the different approaches.

## Make The Alternatives Easy To Discuss

When comparison would help, offer a small set of meaningfully different rough
sketches at 320×160. Compare them with the same values, font treatment and
output scale, so rendering polish does not decide between concepts. Use original
geometry. Describe what each idea communicates,
how the real controls affect it and where a precise readout belongs. Show a
changed state when that reveals more than another paragraph. Avoid presenting
polished variants of the same drawing as different concepts.

For example, a resonator with tuning, decay and texture controls might be
explored as an elastic loop, a set of interacting chambers or an abstract field
of contours. In each, make the relationship to those actual controls explicit.
The loop might make tuning easier to understand; chambers might explain several
resonances; contours might better express a continuous texture. Those are
questions to test with the user, not reasons to invent new DSP behaviour.

Invite useful reactions such as “the loop explains tuning, but the texture
marks feel too busy”. Carry that insight into the next sketch. Keep the chosen
direction and the reason for it; do not impose a new approval gate for every
small adjustment.

## Develop The Chosen Direction

Bring in [Spec](SPEC.md) for type, anchors and clearances and
[Graphics](GRAPHICS.md) for a feasible drawing strategy. Separate stable
geometry from changing parts. Explore event poses before committing to an
animation, then preserve movement that has a musical purpose within a measured
budget. Check the extremes as well as the attractive default state.

Use [Verification](VERIFICATION.md) to inspect real host captures, including
readable lettering, complete values and changing geometry. A promising sketch
is the start of the design, not evidence that the finished screen fits or runs
well on hardware.
