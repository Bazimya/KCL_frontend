// Static descriptive content for the Course section. Coffee Therapy and
// Coffee Experience are purely informational pages (no admin management
// needed). The 4 Coffee Training courses below are informational PLUS
// backed by live data (sessions/cohorts, countdowns, applications) from
// the /training API - see TrainingCourseDetail.jsx.

export const coffeeTherapy = {
  title: 'Coffee Therapy',
  tagline: 'Bring it. Make it. Brew it. Enjoy it.',
  intro: 'Coffee Therapy is a coffee experience where people come together to have fun, connect, experiment, and create their own coffee.',
  body: 'You can come with your friends, bring your own coffee beans, coffee flour, or favourite ingredients, and turn your visit into an experience. Instead of simply ordering a cup, you can learn, experiment, roast, grind, mix, brew, taste, and enjoy coffee your own way.',
  points: [
    { emoji: '☕', text: 'Coffee becomes an experience' },
    { emoji: '👥', text: 'Friends become part of the experience' },
    { emoji: '🌱', text: 'Your own coffee can become your creation' },
    { emoji: '🧪', text: 'Experimentation becomes part of the fun' },
    { emoji: '😂', text: 'Good coffee comes with good moments' },
  ],
  idea: "Don't just drink coffee. Experience it.",
  closing: 'Coffee Therapy is a place to bring your coffee, bring your friends, bring your creativity, and make your own coffee story.',
}

export const coffeeExperience = {
  title: 'Coffee Experience',
  tagline: 'From the Farm to Your Cup.',
  intro: 'Coffee Experience is a journey from the coffee farm to your cup.',
  body: 'It gives tourists, visitors, coffee lovers, families, and friends the opportunity to step into a real coffee farm and experience coffee with their own hands.',
  points: [
    { emoji: '🌱', title: 'Walk through the coffee farm', text: "Learn where coffee grows and how farmers care for the plants." },
    { emoji: '🫘', title: 'Pick ripe coffee cherries', text: 'Go into the farm and pick coffee cherries yourself.' },
    { emoji: '🤲', title: 'Process the coffee', text: 'Experience the traditional steps of turning coffee cherries into coffee beans.' },
    { emoji: '🔥', title: 'Roast your coffee', text: 'Watch or participate in roasting and discover how roasting changes the flavour.' },
    { emoji: '☕', title: 'Grind and brew your own coffee', text: 'Take the coffee you helped create and prepare your own cup.' },
    { emoji: '👥', title: 'Share the experience', text: 'Enjoy the coffee with friends, family, other travellers, or local farmers.' },
  ],
  idea: "You don't just drink coffee. You experience where it comes from. From the farm, the cherry, the bean, the roast, to the cup, every step becomes part of the experience.",
  taglines: [
    'From the Farm to Your Cup.',
    'Pick It. Process It. Roast It. Taste It.',
    "Don't Just Drink Coffee. Experience It.",
    'Your Coffee. Your Journey.',
    'Experience Coffee at Its Source.',
  ],
  journey: ['Farm', 'Pick Cherries', 'Process', 'Roast', 'Cupping', 'Brew', 'Enjoy'],
}

// Barista is a local course run by the shop/lab itself (no `level`).
// Cupping/Sensory, Roasting, and CVA each lead toward a global
// certification track, offered at 3 levels: Foundation, Intermediate,
// Professional.
export const trainingCourses = {
  barista: {
    title: 'Barista Training',
    isGlobalCertificate: false,
    certNote: 'Local training provided directly by Kigali Coffee Lab.',
    intro: 'Hands-on training that takes you from first-timer to confident barista.',
    body: 'Our Barista program is a local, shop-run course covering everything: grinding and dosing, extraction theory, milk steaming, latte art, and running a coffee bar from open to close. Perfect whether you\'re equipping your own kitchen, opening a cafe, or starting a new career.',
    points: [
      { emoji: '⚙️', text: 'Grinding, dosing and tamping fundamentals' },
      { emoji: '☕', text: 'Espresso extraction theory and troubleshooting' },
      { emoji: '🥛', text: 'Milk steaming and latte art' },
      { emoji: '🧑‍🏫', text: 'Running a coffee bar from open to close' },
    ],
  },
  cupping: {
    title: 'Coffee Cupping / Sensory',
    isGlobalCertificate: true,
    certNote: 'An international certification pathway (Foundation, Intermediate, Professional), recognised toward credentials such as the Q Grader.',
    intro: 'Coffee cupping is the professional method of tasting and evaluating coffee to understand its aroma, flavour, acidity, sweetness, body, aftertaste, and overall quality.',
    body: "One important distinction: a Q Grader license is a professional credential, not simply a normal coffee-cupping class. The requirements, course structure, and certification arrangements can change, so they should be checked with the current authorised training provider.",
    levelsTable: [
      { level: '🌱 Beginner', learn: 'How coffee cherries become beans and the basics of coffee tasting' },
      { level: '👃 Sensory Experience', learn: 'Smell different aromas and identify flavours' },
      { level: '☕ Cupping Session', learn: 'Taste several coffees side-by-side and compare them' },
      { level: '🔥 Roasting', learn: 'See how different roast levels affect flavour' },
      { level: '🫘 Coffee Processing', learn: 'Learn washed, natural, honey, and other processing methods' },
      { level: '🧑‍🏫 Advanced Training', learn: 'Structured sensory evaluation and professional cupping' },
      { level: '🏆 Professional Certification', learn: 'Training pathways that can lead toward recognised industry credentials such as the Q Grader' },
    ],
    journey: ['Coffee Farm', 'Pick Cherries', 'Process', 'Roast', 'Cupping', 'Brew', 'Enjoy'],
    closing: 'This makes Coffee Experience much bigger than a coffee shop. It becomes coffee tourism plus education plus a hands-on farm experience.',
  },
  roasting: {
    title: 'Coffee Roasting',
    isGlobalCertificate: true,
    certNote: 'An international certification pathway (Foundation, Intermediate, Professional).',
    intro: 'Coffee roasting training teaches you how to transform green coffee beans into aromatic, flavourful roasted coffee through heat, timing, and careful observation.',
    body: "Visitors don't just watch the coffee being roasted, they can participate in the process, learn how different roasting choices change the coffee, and eventually taste the coffee they helped roast.",
    points: [
      { emoji: '🌱', text: 'Understand different green coffee beans and their characteristics' },
      { emoji: '🔥', text: 'Control heat and roasting time' },
      { emoji: '📈', text: 'Create and adjust roast profiles' },
      { emoji: '👃', text: 'Observe changes in aroma, colour, and flavour during roasting' },
      { emoji: '🫘', text: 'Understand how roasting affects the final cup' },
      { emoji: '☕', text: 'Taste and evaluate the roasted coffee through sensory analysis' },
    ],
    idea: 'From green bean to golden roast, experience the transformation.',
    journey: ['Farm', 'Pick', 'Process', 'Roast', 'Cup', 'Brew', 'Enjoy'],
  },
  cva: {
    title: 'Coffee Value Assessment (CVA)',
    isGlobalCertificate: true,
    certNote: 'An international certification pathway (Foundation, Intermediate, Professional), based on the SCA Coffee Value Assessment framework.',
    intro: "In the SCA Coffee Value Assessment (CVA) framework, Extrinsic Attributes refers to information about the coffee beyond what can be directly tasted or measured in the cup.",
    points: [
      { emoji: '🌍', text: 'Origin, country, region, district, farm, or specific lot' },
      { emoji: '🌱', text: 'Growing location, altitude, climate, soil, and geographical characteristics' },
      { emoji: '🫘', text: 'Cultivar/variety, e.g. Bourbon, Caturra, SL28, or locally identified varieties' },
      { emoji: '⚙️', text: 'Processing method, washed, natural, honey, anaerobic, etc.' },
      { emoji: '👨‍🌾', text: 'Producer/farm information, farmer, cooperative, estate, or producer group' },
      { emoji: '🏷️', text: 'Certifications, organic, Fairtrade, Rainforest Alliance, and other relevant certifications' },
      { emoji: '📖', text: 'Traceability and story of how and where the coffee was produced' },
      { emoji: '🤝', text: "Supply-chain information that can contribute to the coffee's commercial or contextual value" },
    ],
    body: "The important point is that extrinsic attributes aren't the same as flavour evaluation. They provide context that can help explain the coffee's identity, provenance, production method, and potential value.",
    idea: '"Know Your Coffee": discover the farm, altitude, variety, processing method, producer, and story behind the coffee you\'re tasting.',
    journey: ['Farm', 'Variety', 'Processing', 'Roasting', 'Cupping', 'Coffee Value Assessment', 'Final Cup'],
  },
}

export const courseLevels = ['Foundation', 'Intermediate', 'Professional']
