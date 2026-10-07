# Tasks

Design system component work. Four tasks per component, 29 components, 116 tasks. Task numbers are T1 to T116, numbered in the order they appear in this file.

**How to read this file**
- Components are in the build order from figma-build-order.md: Simple, Medium, Hardest, Last, then No Dedicated Token.
- Inherited components are part of their parent component's tasks. Each group lists what it includes.
- A task is not complete until its blocker is complete and its sign-off is done.

**Task types and sign-off**
- Validate requirements: review the requirements for accuracy and completeness. Reviewers: Vivek and Louis, per component-token-workflow.md Phase 1.
- Generate component tokens: blocked by the Validate requirements task. An engineer must validate that the tokens are sufficient, usable, and accurate.
- Connect component to Figma: blocked by the Generate component tokens task. A design system SME must review and approve.
- Create component documentation: blocked by the Connect component to Figma task. A content designer must review.

## Active

### Simple

#### Radio

Token type: NEW. Requirements source: Components-Data Entry requirements.md (Radio, Checkbox).
Inherited parts: Checkbox. Inherited parts add at most a small addition to the parent tokens.

- [ ] **T1. Validate requirements: Radio** - Review the requirements for Radio (includes Checkbox) for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T2. Generate component tokens: Radio** - Generate component tokens for Radio (includes Checkbox). Define the parent tokens first, then add only what each inherited part needs.
    - Blocked by: T1 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T3. Connect component to Figma: Radio** - Connect Radio (includes Checkbox) to Figma using the component tokens.
    - Blocked by: T2 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T4. Create component documentation: Radio** - Write documentation for Radio (includes Checkbox).
    - Blocked by: T3 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Toggle

Token type: NEW. Requirements source: Components-Data Entry requirements.md (Toggle).

- [ ] **T5. Validate requirements: Toggle** - Review the requirements for Toggle for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T6. Generate component tokens: Toggle** - Generate component tokens for Toggle.
    - Blocked by: T5 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T7. Connect component to Figma: Toggle** - Connect Toggle to Figma using the component tokens.
    - Blocked by: T6 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T8. Create component documentation: Toggle** - Write documentation for Toggle.
    - Blocked by: T7 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Button

Token type: NEW. Requirements source: Components-Action - requirements.md (Button, Split Button, Button Group) and Components-Navigation and Structure-requirements.md (Pagination).
Inherited parts: Split Button, Button Group, Pagination. Inherited parts add at most a small addition to the parent tokens.
Note: Recheck against real requirements.

- [ ] **T9. Validate requirements: Button** - Review the requirements for Button (includes Split Button, Button Group, Pagination) for accuracy and completeness. Confirm no visual values remain. Recheck the requirements against real usage.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T10. Generate component tokens: Button** - Generate component tokens for Button (includes Split Button, Button Group, Pagination). Define the parent tokens first, then add only what each inherited part needs.
    - Blocked by: T9 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T11. Connect component to Figma: Button** - Connect Button (includes Split Button, Button Group, Pagination) to Figma using the component tokens.
    - Blocked by: T10 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T12. Create component documentation: Button** - Write documentation for Button (includes Split Button, Button Group, Pagination).
    - Blocked by: T11 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Text Input

Token type: NEW. Requirements source: Components-Data Entry requirements.md (Input (Text Field), Text Area, Number Input, Search, WYSIWYG Toolbar).
Inherited parts: Text Area, Number Input, Search, WYSIWYG. Inherited parts add at most a small addition to the parent tokens.

- [ ] **T13. Validate requirements: Text Input** - Review the requirements for Text Input (includes Text Area, Number Input, Search, WYSIWYG) for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T14. Generate component tokens: Text Input** - Generate component tokens for Text Input (includes Text Area, Number Input, Search, WYSIWYG). Define the parent tokens first, then add only what each inherited part needs.
    - Blocked by: T13 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T15. Connect component to Figma: Text Input** - Connect Text Input (includes Text Area, Number Input, Search, WYSIWYG) to Figma using the component tokens.
    - Blocked by: T14 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T16. Create component documentation: Text Input** - Write documentation for Text Input (includes Text Area, Number Input, Search, WYSIWYG).
    - Blocked by: T15 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Progress Bar

Token type: NEW. Requirements source: Components-Feedback_and_Status-requirements.md (Progress Indicator (Bar), Progress Circle).
Inherited parts: Progress Circle. Inherited parts add at most a small addition to the parent tokens.

- [ ] **T17. Validate requirements: Progress Bar** - Review the requirements for Progress Bar (includes Progress Circle) for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T18. Generate component tokens: Progress Bar** - Generate component tokens for Progress Bar (includes Progress Circle). Define the parent tokens first, then add only what each inherited part needs.
    - Blocked by: T17 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T19. Connect component to Figma: Progress Bar** - Connect Progress Bar (includes Progress Circle) to Figma using the component tokens.
    - Blocked by: T18 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T20. Create component documentation: Progress Bar** - Write documentation for Progress Bar (includes Progress Circle).
    - Blocked by: T19 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Skeleton Loader

Token type: NEW. Requirements source: Components-Feedback_and_Status-requirements.md (Skeleton Loader).

- [ ] **T21. Validate requirements: Skeleton Loader** - Review the requirements for Skeleton Loader for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T22. Generate component tokens: Skeleton Loader** - Generate component tokens for Skeleton Loader.
    - Blocked by: T21 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T23. Connect component to Figma: Skeleton Loader** - Connect Skeleton Loader to Figma using the component tokens.
    - Blocked by: T22 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T24. Create component documentation: Skeleton Loader** - Write documentation for Skeleton Loader.
    - Blocked by: T23 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Spinner

Token type: NEW. Requirements source: Components-Feedback_and_Status-requirements.md (Spinner).

- [ ] **T25. Validate requirements: Spinner** - Review the requirements for Spinner for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T26. Generate component tokens: Spinner** - Generate component tokens for Spinner.
    - Blocked by: T25 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T27. Connect component to Figma: Spinner** - Connect Spinner to Figma using the component tokens.
    - Blocked by: T26 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T28. Create component documentation: Spinner** - Write documentation for Spinner.
    - Blocked by: T27 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Badge

Token type: NEW. Requirements source: Components-Feedback_and_Status-requirements.md (Badge, Chip) and Components-Navigation and Structure-requirements.md (Progress Steps (Stepper)).
Inherited parts: Chip, Progress Steps. Inherited parts add at most a small addition to the parent tokens.
Note: Progress Steps inherits from Progress Bar and Badge. It is grouped here because Badge is built after Progress Bar.

- [ ] **T29. Validate requirements: Badge** - Review the requirements for Badge (includes Chip, Progress Steps) for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T30. Generate component tokens: Badge** - Generate component tokens for Badge (includes Chip, Progress Steps). Define the parent tokens first, then add only what each inherited part needs.
    - Blocked by: T29 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T31. Connect component to Figma: Badge** - Connect Badge (includes Chip, Progress Steps) to Figma using the component tokens.
    - Blocked by: T30 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T32. Create component documentation: Badge** - Write documentation for Badge (includes Chip, Progress Steps).
    - Blocked by: T31 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Slider

Token type: NEW. Requirements source: Components-Data Entry requirements.md (Slider).

- [ ] **T33. Validate requirements: Slider** - Review the requirements for Slider for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T34. Generate component tokens: Slider** - Generate component tokens for Slider.
    - Blocked by: T33 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T35. Connect component to Figma: Slider** - Connect Slider to Figma using the component tokens.
    - Blocked by: T34 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T36. Create component documentation: Slider** - Write documentation for Slider.
    - Blocked by: T35 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Link

Token type: NEW. Requirements source: Components-Action - requirements.md (Link).
Note: Recheck against real requirements.

- [ ] **T37. Validate requirements: Link** - Review the requirements for Link for accuracy and completeness. Confirm no visual values remain. Recheck the requirements against real usage.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T38. Generate component tokens: Link** - Generate component tokens for Link.
    - Blocked by: T37 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T39. Connect component to Figma: Link** - Connect Link to Figma using the component tokens.
    - Blocked by: T38 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T40. Create component documentation: Link** - Write documentation for Link.
    - Blocked by: T39 must be done.
    - Sign-off: a content designer reviews the documentation.

### Medium

#### File Upload

Token type: NEW. Requirements source: Components-Data Entry requirements.md (File Upload).

- [ ] **T41. Validate requirements: File Upload** - Review the requirements for File Upload for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T42. Generate component tokens: File Upload** - Generate component tokens for File Upload.
    - Blocked by: T41 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T43. Connect component to Figma: File Upload** - Connect File Upload to Figma using the component tokens.
    - Blocked by: T42 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T44. Create component documentation: File Upload** - Write documentation for File Upload.
    - Blocked by: T43 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Menu

Token type: NEW. Requirements source: Components-Action - requirements.md (Menu (Dropdown + Select Menu merged)) and Components-Data Entry requirements.md (Single-Select, Multi-Select).
Inherited parts: Single Select, Multi Select. Inherited parts add at most a small addition to the parent tokens.
Note: Single Select and Multi Select inherit from Text Input and Menu. They are grouped here because Menu is built after Text Input. Multi-Select is marked as needing redesign in its requirements, so selection at scale is an open decision.

- [ ] **T45. Validate requirements: Menu** - Review the requirements for Menu (includes Single Select, Multi Select) for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T46. Generate component tokens: Menu** - Generate component tokens for Menu (includes Single Select, Multi Select). Define the parent tokens first, then add only what each inherited part needs.
    - Blocked by: T45 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T47. Connect component to Figma: Menu** - Connect Menu (includes Single Select, Multi Select) to Figma using the component tokens.
    - Blocked by: T46 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T48. Create component documentation: Menu** - Write documentation for Menu (includes Single Select, Multi Select).
    - Blocked by: T47 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Toast

Token type: NEW. Requirements source: Components-Feedback_and_Status-requirements.md (Toast).

- [ ] **T49. Validate requirements: Toast** - Review the requirements for Toast for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T50. Generate component tokens: Toast** - Generate component tokens for Toast.
    - Blocked by: T49 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T51. Connect component to Figma: Toast** - Connect Toast to Figma using the component tokens.
    - Blocked by: T50 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T52. Create component documentation: Toast** - Write documentation for Toast.
    - Blocked by: T51 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Alert and Banner

Token type: NEW. Requirements source: Components-Feedback_and_Status-requirements.md (Banner (Alert + Banner merged)).

- [ ] **T53. Validate requirements: Alert and Banner** - Review the requirements for Alert and Banner for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T54. Generate component tokens: Alert and Banner** - Generate component tokens for Alert and Banner.
    - Blocked by: T53 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T55. Connect component to Figma: Alert and Banner** - Connect Alert and Banner to Figma using the component tokens.
    - Blocked by: T54 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T56. Create component documentation: Alert and Banner** - Write documentation for Alert and Banner.
    - Blocked by: T55 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Accordion

Token type: NEW. Requirements source: Components-Container-requirements.md (Accordion).

- [ ] **T57. Validate requirements: Accordion** - Review the requirements for Accordion for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T58. Generate component tokens: Accordion** - Generate component tokens for Accordion.
    - Blocked by: T57 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T59. Connect component to Figma: Accordion** - Connect Accordion to Figma using the component tokens.
    - Blocked by: T58 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T60. Create component documentation: Accordion** - Write documentation for Accordion.
    - Blocked by: T59 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Tooltip and Popover

Token type: NEW. Requirements source: Components-Container-requirements.md (Popover (Tooltip + Popover merged)).

- [ ] **T61. Validate requirements: Tooltip and Popover** - Review the requirements for Tooltip and Popover for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T62. Generate component tokens: Tooltip and Popover** - Generate component tokens for Tooltip and Popover.
    - Blocked by: T61 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T63. Connect component to Figma: Tooltip and Popover** - Connect Tooltip and Popover to Figma using the component tokens.
    - Blocked by: T62 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T64. Create component documentation: Tooltip and Popover** - Write documentation for Tooltip and Popover.
    - Blocked by: T63 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Drawer

Token type: NEW. Requirements source: Components-Container-requirements.md (Drawer, Side Panel (Side Panel + Collapsible Panel merged)).
Inherited parts: Side Panel / Collapsible Panel. Inherited parts add at most a small addition to the parent tokens.
Note: Recheck against real requirements.

- [ ] **T65. Validate requirements: Drawer** - Review the requirements for Drawer (includes Side Panel / Collapsible Panel) for accuracy and completeness. Confirm no visual values remain. Recheck the requirements against real usage.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T66. Generate component tokens: Drawer** - Generate component tokens for Drawer (includes Side Panel / Collapsible Panel). Define the parent tokens first, then add only what each inherited part needs.
    - Blocked by: T65 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T67. Connect component to Figma: Drawer** - Connect Drawer (includes Side Panel / Collapsible Panel) to Figma using the component tokens.
    - Blocked by: T66 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T68. Create component documentation: Drawer** - Write documentation for Drawer (includes Side Panel / Collapsible Panel).
    - Blocked by: T67 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Sidebar

Token type: NEW. Requirements source: Components-Navigation and Structure-requirements.md (Nav (Sidebar)).
Note: Recheck against real requirements.

- [ ] **T69. Validate requirements: Sidebar** - Review the requirements for Sidebar for accuracy and completeness. Confirm no visual values remain. Recheck the requirements against real usage.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T70. Generate component tokens: Sidebar** - Generate component tokens for Sidebar.
    - Blocked by: T69 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T71. Connect component to Figma: Sidebar** - Connect Sidebar to Figma using the component tokens.
    - Blocked by: T70 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T72. Create component documentation: Sidebar** - Write documentation for Sidebar.
    - Blocked by: T71 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Tabs

Token type: NEW. Requirements source: Components-Navigation and Structure-requirements.md (Tabs).
Note: Recheck against real requirements.

- [ ] **T73. Validate requirements: Tabs** - Review the requirements for Tabs for accuracy and completeness. Confirm no visual values remain. Recheck the requirements against real usage.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T74. Generate component tokens: Tabs** - Generate component tokens for Tabs.
    - Blocked by: T73 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T75. Connect component to Figma: Tabs** - Connect Tabs to Figma using the component tokens.
    - Blocked by: T74 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T76. Create component documentation: Tabs** - Write documentation for Tabs.
    - Blocked by: T75 must be done.
    - Sign-off: a content designer reviews the documentation.

### Hardest

#### Date Picker

Token type: NEW. Requirements source: Components-Data Entry requirements.md (Date Picker, Time Picker).
Inherited parts: Time Picker. Inherited parts add at most a small addition to the parent tokens.

- [ ] **T77. Validate requirements: Date Picker** - Review the requirements for Date Picker (includes Time Picker) for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T78. Generate component tokens: Date Picker** - Generate component tokens for Date Picker (includes Time Picker). Define the parent tokens first, then add only what each inherited part needs.
    - Blocked by: T77 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T79. Connect component to Figma: Date Picker** - Connect Date Picker (includes Time Picker) to Figma using the component tokens.
    - Blocked by: T78 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T80. Create component documentation: Date Picker** - Write documentation for Date Picker (includes Time Picker).
    - Blocked by: T79 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Modal

Token type: NEW. Requirements source: Components-Container-requirements.md (Dialog (Modal + Dialog Box merged)).

- [ ] **T81. Validate requirements: Modal** - Review the requirements for Modal for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T82. Generate component tokens: Modal** - Generate component tokens for Modal.
    - Blocked by: T81 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T83. Connect component to Figma: Modal** - Connect Modal to Figma using the component tokens.
    - Blocked by: T82 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T84. Create component documentation: Modal** - Write documentation for Modal.
    - Blocked by: T83 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Top Bar

Token type: NEW. Requirements source: Components-Navigation and Structure-requirements.md (Top Bar).

- [ ] **T85. Validate requirements: Top Bar** - Review the requirements for Top Bar for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T86. Generate component tokens: Top Bar** - Generate component tokens for Top Bar.
    - Blocked by: T85 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T87. Connect component to Figma: Top Bar** - Connect Top Bar to Figma using the component tokens.
    - Blocked by: T86 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T88. Create component documentation: Top Bar** - Write documentation for Top Bar.
    - Blocked by: T87 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Table

Token type: NEW. Requirements source: Components-Navigation and Structure-requirements.md (Table).

- [ ] **T89. Validate requirements: Table** - Review the requirements for Table for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T90. Generate component tokens: Table** - Generate component tokens for Table.
    - Blocked by: T89 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T91. Connect component to Figma: Table** - Connect Table to Figma using the component tokens.
    - Blocked by: T90 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T92. Create component documentation: Table** - Write documentation for Table.
    - Blocked by: T91 must be done.
    - Sign-off: a content designer reviews the documentation.

### Last

No tasks currently. WYSIWYG moved into Text Input as an inherited part.

### No dedicated token

#### Breadcrumb

Token type: NONE. Requirements source: Components-Navigation and Structure-requirements.md (Breadcrumb).

- [ ] **T93. Validate requirements: Breadcrumb** - Review the requirements for Breadcrumb for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T94. Generate component tokens: Breadcrumb** - Confirm semantic tokens cover Breadcrumb and that no dedicated component token is needed. Record the result.
    - Blocked by: T93 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T95. Connect component to Figma: Breadcrumb** - Connect Breadcrumb to Figma using the component tokens.
    - Blocked by: T94 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T96. Create component documentation: Breadcrumb** - Write documentation for Breadcrumb.
    - Blocked by: T95 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Avatar

Token type: NONE. Requirements source: Components-Feedback_and_Status-requirements.md (Avatar).

- [ ] **T97. Validate requirements: Avatar** - Review the requirements for Avatar for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T98. Generate component tokens: Avatar** - Confirm semantic tokens cover Avatar and that no dedicated component token is needed. Record the result.
    - Blocked by: T97 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T99. Connect component to Figma: Avatar** - Connect Avatar to Figma using the component tokens.
    - Blocked by: T98 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T100. Create component documentation: Avatar** - Write documentation for Avatar.
    - Blocked by: T99 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Card

Token type: NONE. Requirements source: Components-Container-requirements.md (Card).

- [ ] **T101. Validate requirements: Card** - Review the requirements for Card for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T102. Generate component tokens: Card** - Confirm semantic tokens cover Card and that no dedicated component token is needed. Record the result.
    - Blocked by: T101 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T103. Connect component to Figma: Card** - Connect Card to Figma using the component tokens.
    - Blocked by: T102 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T104. Create component documentation: Card** - Write documentation for Card.
    - Blocked by: T103 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Page Header

Token type: NONE. Requirements source: Components-Navigation and Structure-requirements.md (Page Header).

- [ ] **T105. Validate requirements: Page Header** - Review the requirements for Page Header for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T106. Generate component tokens: Page Header** - Confirm semantic tokens cover Page Header and that no dedicated component token is needed. Record the result.
    - Blocked by: T105 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T107. Connect component to Figma: Page Header** - Connect Page Header to Figma using the component tokens.
    - Blocked by: T106 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T108. Create component documentation: Page Header** - Write documentation for Page Header.
    - Blocked by: T107 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Empty State

Token type: NONE. Requirements source: Components-Feedback_and_Status-requirements.md (Empty State).

- [ ] **T109. Validate requirements: Empty State** - Review the requirements for Empty State for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T110. Generate component tokens: Empty State** - Confirm semantic tokens cover Empty State and that no dedicated component token is needed. Record the result.
    - Blocked by: T109 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T111. Connect component to Figma: Empty State** - Connect Empty State to Figma using the component tokens.
    - Blocked by: T110 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T112. Create component documentation: Empty State** - Write documentation for Empty State.
    - Blocked by: T111 must be done.
    - Sign-off: a content designer reviews the documentation.

#### Delta Display

Token type: NONE. Requirements source: Components-Navigation and Structure-requirements.md (Data Metric (assumed match, unconfirmed)).
Note: Build order marks this NONE (if needed). No section named Delta Display exists in the requirements, and Data Metric is the closest match.

- [ ] **T113. Validate requirements: Delta Display** - Review the requirements for Delta Display for accuracy and completeness. Confirm no visual values remain.
    - Sign-off: Vivek and Louis review against the FigJam audit.
- [ ] **T114. Generate component tokens: Delta Display** - Confirm semantic tokens cover Delta Display and that no dedicated component token is needed. Record the result.
    - Blocked by: T113 must be done.
    - Sign-off: an engineer validates the tokens are sufficient, usable, and accurate.
- [ ] **T115. Connect component to Figma: Delta Display** - Connect Delta Display to Figma using the component tokens.
    - Blocked by: T114 must be done.
    - Sign-off: a design system SME reviews and approves.
- [ ] **T116. Create component documentation: Delta Display** - Write documentation for Delta Display.
    - Blocked by: T115 must be done.
    - Sign-off: a content designer reviews the documentation.

## Waiting On

## Someday

No tasks created. Build order marks these as PENDING and says to confirm before building.

- List
- Sortable List
- Truncated List
- Tree View

The September 9, 2026 snapshot in design-system-project-knowledge.md says List and Tree View are not in the live 42-component set. Decide whether to build any of these before adding tasks.

## Done

## Notes and assumptions

- **Component names differ between files.** Build order name to requirements name: Modal is Dialog, Alert and Banner is Banner, Tooltip and Popover is Popover, Sidebar is Nav (Sidebar), Progress Bar is Progress Indicator (Bar), Text Input is Input (Text Field). Table and Pagination sit in the Navigation and Structure file, not a separate Data file.
- **Dual inheritance.** Single Select, Multi Select, and Progress Steps each inherit from two components. They are grouped with the parent built later (Menu, Badge) so both dependencies are met. This moves Progress Steps earlier than its Medium position in the build order.
- **Documentation blocker wording.** The request says documentation is blocked by a "Generate components" task. No task type has that name, so documentation is blocked by Connect component to Figma.
- **NONE components.** Each still has a tokens task, scoped to confirming that semantic tokens are enough. Drop those tokens tasks if you decide NONE components need no token step.
- **Delta Display.** Matched to Data Metric in the requirements. Confirm this is correct.
- **WYSIWYG moved to Text Input.** WYSIWYG is now an inherited part of Text Input, so it is built in the Simple tier and no longer Last. Its former tasks were removed and all tasks renumbered. Toolbar controls likely reuse Button and icon action tokens, so this is dual inheritance (Text Input and Button).
- **Button moved before Text Input.** Button (T9 to T12) now sits ahead of Text Input in the Simple tier so both WYSIWYG dependencies are met. Tasks were renumbered to match the new order. Pagination, a Button inherited part, has a page-size dropdown that may need Menu tokens. Check that before building it.
- **Check WYSIWYG scope.** Confirm WYSIWYG fits the "small addition" rule for inherited parts. Its requirements list states, a floating variant, and overflow behavior that go beyond a small addition.
- **Not in the build order.** These have requirements but no build order entry: Code Snippet, Data Metric (see Delta Display), Divider, Form Group, Data Table Toolbar, Infinite Scroll, Sticky Behavior, Truncation + Ellipsis. Confirm whether they need tasks.
- **Component count.** figma-build-order.md lists 30 groups here. component-token-workflow.md refers to 48 components and the knowledge base refers to 42. Reconcile the counts.

Last updated on October 1, 2026
