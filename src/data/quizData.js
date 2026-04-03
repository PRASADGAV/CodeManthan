// Quiz questions bank organized by subject and topic
// Each question has difficulty: 'easy', 'medium', 'hard'

const quizData = {
  Mathematics: {
    Algebra: [
      {
        id: 'math-alg-1',
        question: 'Solve for x: 2x + 5 = 13',
        options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4'
      },
      {
        id: 'math-alg-2',
        question: 'What is the value of x in: 3x² - 12 = 0?',
        options: ['x = ±1', 'x = ±2', 'x = ±3', 'x = ±4'],
        correct: 1,
        difficulty: 'medium',
        explanation: '3x² = 12, x² = 4, x = ±2'
      },
      {
        id: 'math-alg-3',
        question: 'Simplify: (x² - 9) / (x - 3)',
        options: ['x - 3', 'x + 3', 'x² - 3', '9 - x'],
        correct: 1,
        difficulty: 'medium',
        explanation: 'x² - 9 = (x+3)(x-3), so (x+3)(x-3)/(x-3) = x+3'
      },
      {
        id: 'math-alg-4',
        question: 'If f(x) = 2x³ - 5x + 1, find f(2)',
        options: ['5', '7', '9', '11'],
        correct: 1,
        difficulty: 'hard',
        explanation: 'f(2) = 2(8) - 5(2) + 1 = 16 - 10 + 1 = 7'
      },
      {
        id: 'math-alg-5',
        question: 'Solve: |2x - 3| = 7',
        options: ['x = 5 or x = -2', 'x = 5 or x = 2', 'x = -5 or x = 2', 'x = 2 or x = 3'],
        correct: 0,
        difficulty: 'hard',
        explanation: '2x - 3 = 7 → x = 5, or 2x - 3 = -7 → x = -2'
      },
      {
        id: 'math-alg-6',
        question: 'What is the sum of roots of x² - 7x + 12 = 0?',
        options: ['5', '7', '12', '-7'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'By Vieta\'s formulas, sum of roots = -(-7)/1 = 7'
      },
      {
        id: 'math-alg-7',
        question: 'Factor: x³ - 8',
        options: ['(x-2)(x²+2x+4)', '(x-2)(x²-2x+4)', '(x+2)(x²-2x+4)', '(x-2)(x²+4)'],
        correct: 0,
        difficulty: 'hard',
        explanation: 'Using difference of cubes: a³-b³ = (a-b)(a²+ab+b²), where a=x, b=2'
      },
      {
        id: 'math-alg-8',
        question: 'Solve: 5(x - 2) = 3(x + 4)',
        options: ['x = 7', 'x = 9', 'x = 11', 'x = 13'],
        correct: 2,
        difficulty: 'easy',
        explanation: '5x - 10 = 3x + 12, 2x = 22, x = 11'
      },
    ],
    Geometry: [
      {
        id: 'math-geo-1',
        question: 'What is the area of a circle with radius 7 cm?',
        options: ['44 cm²', '154 cm²', '22 cm²', '308 cm²'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'Area = πr² = (22/7)(49) = 154 cm²'
      },
      {
        id: 'math-geo-2',
        question: 'What is the sum of interior angles of a hexagon?',
        options: ['360°', '540°', '720°', '900°'],
        correct: 2,
        difficulty: 'medium',
        explanation: 'Sum = (n-2) × 180° = (6-2) × 180° = 720°'
      },
      {
        id: 'math-geo-3',
        question: 'Find the hypotenuse of a right triangle with legs 6 and 8.',
        options: ['9', '10', '12', '14'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'c² = a² + b² = 36 + 64 = 100, c = 10'
      },
      {
        id: 'math-geo-4',
        question: 'What is the volume of a sphere with radius 3 cm?',
        options: ['36π cm³', '27π cm³', '12π cm³', '108π cm³'],
        correct: 0,
        difficulty: 'medium',
        explanation: 'V = (4/3)πr³ = (4/3)π(27) = 36π cm³'
      },
      {
        id: 'math-geo-5',
        question: 'In a regular pentagon, what is each interior angle?',
        options: ['100°', '108°', '120°', '135°'],
        correct: 1,
        difficulty: 'medium',
        explanation: 'Each angle = (n-2)×180/n = (3×180)/5 = 108°'
      },
      {
        id: 'math-geo-6',
        question: 'A cone has radius 4 cm and height 3 cm. What is its slant height?',
        options: ['4 cm', '5 cm', '6 cm', '7 cm'],
        correct: 1,
        difficulty: 'hard',
        explanation: 'Slant height = √(r² + h²) = √(16 + 9) = √25 = 5 cm'
      },
    ],
    Calculus: [
      {
        id: 'math-calc-1',
        question: 'What is the derivative of x³?',
        options: ['x²', '2x²', '3x²', '3x'],
        correct: 2,
        difficulty: 'easy',
        explanation: 'Using power rule: d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x²'
      },
      {
        id: 'math-calc-2',
        question: 'What is ∫ 2x dx?',
        options: ['x²', 'x² + C', '2x²', '2x² + C'],
        correct: 1,
        difficulty: 'easy',
        explanation: '∫ 2x dx = 2·(x²/2) + C = x² + C'
      },
      {
        id: 'math-calc-3',
        question: 'Find dy/dx if y = sin(2x)',
        options: ['cos(2x)', '2cos(2x)', '-sin(2x)', '2sin(2x)'],
        correct: 1,
        difficulty: 'medium',
        explanation: 'Using chain rule: dy/dx = cos(2x) · 2 = 2cos(2x)'
      },
      {
        id: 'math-calc-4',
        question: 'What is the limit of (sin x)/x as x → 0?',
        options: ['0', '1', '∞', 'undefined'],
        correct: 1,
        difficulty: 'medium',
        explanation: 'This is a standard limit: lim(x→0) sin(x)/x = 1'
      },
      {
        id: 'math-calc-5',
        question: 'Find the second derivative of f(x) = x⁴ - 3x²',
        options: ['4x³ - 6x', '12x² - 6', '4x² - 6', '12x - 6'],
        correct: 1,
        difficulty: 'hard',
        explanation: "f'(x) = 4x³ - 6x, f''(x) = 12x² - 6"
      },
      {
        id: 'math-calc-6',
        question: 'Evaluate: ∫₀¹ 3x² dx',
        options: ['0', '1', '3', '1/3'],
        correct: 1,
        difficulty: 'hard',
        explanation: '∫₀¹ 3x² dx = [x³]₀¹ = 1 - 0 = 1'
      },
    ],
  },

  Science: {
    Physics: [
      {
        id: 'sci-phy-1',
        question: 'What is the SI unit of force?',
        options: ['Joule', 'Watt', 'Newton', 'Pascal'],
        correct: 2,
        difficulty: 'easy',
        explanation: 'The SI unit of force is Newton (N), named after Sir Isaac Newton.'
      },
      {
        id: 'sci-phy-2',
        question: "Newton's second law states that F = ?",
        options: ['mv', 'ma', 'mg', 'mv²'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'Force = mass × acceleration (F = ma)'
      },
      {
        id: 'sci-phy-3',
        question: 'A car travels 100 km in 2 hours. What is its average speed?',
        options: ['25 km/h', '50 km/h', '75 km/h', '100 km/h'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'Speed = Distance/Time = 100/2 = 50 km/h'
      },
      {
        id: 'sci-phy-4',
        question: 'What is the kinetic energy of a 2 kg object moving at 3 m/s?',
        options: ['6 J', '9 J', '12 J', '18 J'],
        correct: 1,
        difficulty: 'medium',
        explanation: 'KE = ½mv² = ½ × 2 × 9 = 9 J'
      },
      {
        id: 'sci-phy-5',
        question: 'What happens to the resistance of a conductor when temperature increases?',
        options: ['Decreases', 'Increases', 'Remains same', 'Becomes zero'],
        correct: 1,
        difficulty: 'medium',
        explanation: 'For conductors, resistance increases with temperature due to increased atomic vibrations.'
      },
      {
        id: 'sci-phy-6',
        question: 'In a parallel circuit, the voltage across each component is:',
        options: ['Different', 'Zero', 'The same', 'Doubled'],
        correct: 2,
        difficulty: 'medium',
        explanation: 'In a parallel circuit, voltage across all branches is the same.'
      },
      {
        id: 'sci-phy-7',
        question: 'What is the escape velocity from Earth (approximately)?',
        options: ['7.9 km/s', '9.8 km/s', '11.2 km/s', '15.0 km/s'],
        correct: 2,
        difficulty: 'hard',
        explanation: 'The escape velocity from Earth is approximately 11.2 km/s.'
      },
      {
        id: 'sci-phy-8',
        question: 'Which law states: "For every action, there is an equal and opposite reaction"?',
        options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravitation"],
        correct: 2,
        difficulty: 'easy',
        explanation: "Newton's Third Law of Motion states this principle."
      },
    ],
    Chemistry: [
      {
        id: 'sci-chem-1',
        question: 'What is the chemical symbol for Gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correct: 2,
        difficulty: 'easy',
        explanation: 'Gold\'s symbol Au comes from the Latin word "Aurum".'
      },
      {
        id: 'sci-chem-2',
        question: 'What is the pH of a neutral solution?',
        options: ['0', '7', '14', '1'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'A neutral solution has a pH of 7.'
      },
      {
        id: 'sci-chem-3',
        question: 'How many electrons can the second shell hold?',
        options: ['2', '6', '8', '18'],
        correct: 2,
        difficulty: 'medium',
        explanation: 'The second shell (n=2) can hold 2n² = 2(4) = 8 electrons.'
      },
      {
        id: 'sci-chem-4',
        question: 'What type of bond is formed between Na and Cl?',
        options: ['Covalent', 'Ionic', 'Metallic', 'Hydrogen'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'NaCl is formed by ionic bonding - transfer of electrons from Na to Cl.'
      },
      {
        id: 'sci-chem-5',
        question: 'What is the molar mass of H₂O?',
        options: ['16 g/mol', '17 g/mol', '18 g/mol', '20 g/mol'],
        correct: 2,
        difficulty: 'medium',
        explanation: 'H₂O = 2(1) + 16 = 18 g/mol'
      },
      {
        id: 'sci-chem-6',
        question: 'Which gas is evolved when zinc reacts with dilute HCl?',
        options: ['Oxygen', 'Hydrogen', 'Chlorine', 'Nitrogen'],
        correct: 1,
        difficulty: 'medium',
        explanation: 'Zn + 2HCl → ZnCl₂ + H₂↑ (Hydrogen gas is evolved)'
      },
      {
        id: 'sci-chem-7',
        question: 'What is Avogadro\'s number?',
        options: ['6.022 × 10²⁰', '6.022 × 10²³', '6.022 × 10²⁶', '3.011 × 10²³'],
        correct: 1,
        difficulty: 'hard',
        explanation: 'Avogadro\'s number is 6.022 × 10²³ particles per mole.'
      },
    ],
    Biology: [
      {
        id: 'sci-bio-1',
        question: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic Reticulum'],
        correct: 2,
        difficulty: 'easy',
        explanation: 'Mitochondria are called the powerhouse because they produce ATP through cellular respiration.'
      },
      {
        id: 'sci-bio-2',
        question: 'DNA stands for:',
        options: ['Deoxyribonucleic Acid', 'Dinitrogen Acid', 'Deoxyribose Nucleic Acid', 'Deoxyribo Nucleotide Acid'],
        correct: 0,
        difficulty: 'easy',
        explanation: 'DNA stands for Deoxyribonucleic Acid.'
      },
      {
        id: 'sci-bio-3',
        question: 'Which vitamin is produced when skin is exposed to sunlight?',
        options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'],
        correct: 3,
        difficulty: 'easy',
        explanation: 'Vitamin D is synthesized in the skin upon exposure to UV radiation from sunlight.'
      },
      {
        id: 'sci-bio-4',
        question: 'What is the process by which plants make their own food?',
        options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Fermentation'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'Photosynthesis uses sunlight, CO₂, and water to produce glucose and oxygen.'
      },
      {
        id: 'sci-bio-5',
        question: 'How many chromosomes are in a human somatic cell?',
        options: ['23', '44', '46', '48'],
        correct: 2,
        difficulty: 'medium',
        explanation: 'Human somatic cells contain 46 chromosomes (23 pairs).'
      },
      {
        id: 'sci-bio-6',
        question: 'Which blood type is known as the universal donor?',
        options: ['A+', 'B+', 'AB+', 'O-'],
        correct: 3,
        difficulty: 'medium',
        explanation: 'O- is the universal donor as it lacks A, B antigens and Rh factor.'
      },
      {
        id: 'sci-bio-7',
        question: 'What is the functional unit of the kidney?',
        options: ['Neuron', 'Nephron', 'Alveolus', 'Villus'],
        correct: 1,
        difficulty: 'hard',
        explanation: 'The nephron is the structural and functional unit of the kidney.'
      },
    ],
  },

  'Computer Science': {
    'Data Structures': [
      {
        id: 'cs-ds-1',
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'Binary search halves the search space each time, giving O(log n).'
      },
      {
        id: 'cs-ds-2',
        question: 'Which data structure follows FIFO principle?',
        options: ['Stack', 'Queue', 'Tree', 'Graph'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'Queue follows First In First Out (FIFO) principle.'
      },
      {
        id: 'cs-ds-3',
        question: 'What is the worst-case time complexity of Quick Sort?',
        options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
        correct: 2,
        difficulty: 'medium',
        explanation: 'Quick Sort has O(n²) worst case when pivot selection is poor.'
      },
      {
        id: 'cs-ds-4',
        question: 'In a binary tree, what is the maximum number of nodes at level k?',
        options: ['k', '2k', '2^k', '2^(k+1)'],
        correct: 2,
        difficulty: 'medium',
        explanation: 'At level k (starting from 0), maximum nodes = 2^k.'
      },
      {
        id: 'cs-ds-5',
        question: 'Which data structure is used for BFS traversal?',
        options: ['Stack', 'Queue', 'Heap', 'Array'],
        correct: 1,
        difficulty: 'medium',
        explanation: 'BFS (Breadth-First Search) uses a Queue to explore level by level.'
      },
      {
        id: 'cs-ds-6',
        question: 'What is the space complexity of a hash table?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct: 2,
        difficulty: 'hard',
        explanation: 'A hash table uses O(n) space to store n elements.'
      },
      {
        id: 'cs-ds-7',
        question: 'Which self-balancing BST guarantees O(log n) operations?',
        options: ['Binary Search Tree', 'AVL Tree', 'Linked List', 'Hash Table'],
        correct: 1,
        difficulty: 'hard',
        explanation: 'AVL trees maintain balance factor between -1 and 1, ensuring O(log n).'
      },
    ],
    'Programming Basics': [
      {
        id: 'cs-prog-1',
        question: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'],
        correct: 0,
        difficulty: 'easy',
        explanation: 'HTML = Hyper Text Markup Language, used for structuring web content.'
      },
      {
        id: 'cs-prog-2',
        question: 'Which keyword is used to define a function in Python?',
        options: ['func', 'function', 'def', 'define'],
        correct: 2,
        difficulty: 'easy',
        explanation: 'In Python, the "def" keyword is used to define functions.'
      },
      {
        id: 'cs-prog-3',
        question: 'What is the output of: print(type([]))',
        options: ["<class 'list'>", "<class 'tuple'>", "<class 'dict'>", "<class 'set'>"],
        correct: 0,
        difficulty: 'easy',
        explanation: '[] creates an empty list, so type([]) returns <class \'list\'>.'
      },
      {
        id: 'cs-prog-4',
        question: 'What is the difference between == and === in JavaScript?',
        options: ['No difference', '=== checks type and value', '== is assignment', '=== is deprecated'],
        correct: 1,
        difficulty: 'medium',
        explanation: '=== performs strict equality (checks both type and value), while == performs type coercion.'
      },
      {
        id: 'cs-prog-5',
        question: 'What is a closure in programming?',
        options: ['A way to close a program', 'A function with access to outer scope', 'A type of loop', 'A class method'],
        correct: 1,
        difficulty: 'hard',
        explanation: 'A closure is a function that retains access to variables from its outer (enclosing) scope.'
      },
      {
        id: 'cs-prog-6',
        question: 'Which protocol is used for secure web communication?',
        options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
        correct: 2,
        difficulty: 'easy',
        explanation: 'HTTPS (HTTP Secure) uses TLS/SSL encryption for secure communication.'
      },
    ],
    'Databases': [
      {
        id: 'cs-db-1',
        question: 'SQL stands for:',
        options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'Sequential Query Language'],
        correct: 0,
        difficulty: 'easy',
        explanation: 'SQL stands for Structured Query Language.'
      },
      {
        id: 'cs-db-2',
        question: 'Which SQL command is used to retrieve data?',
        options: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'],
        correct: 2,
        difficulty: 'easy',
        explanation: 'SELECT is used to query and retrieve data from a database.'
      },
      {
        id: 'cs-db-3',
        question: 'What is a primary key?',
        options: ['Any column', 'A unique identifier for each row', 'The first column', 'A foreign reference'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'A primary key uniquely identifies each record in a database table.'
      },
      {
        id: 'cs-db-4',
        question: 'Which normal form eliminates transitive dependencies?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correct: 2,
        difficulty: 'hard',
        explanation: '3NF (Third Normal Form) eliminates transitive dependencies.'
      },
      {
        id: 'cs-db-5',
        question: 'What type of JOIN returns all records from the left table?',
        options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
        correct: 1,
        difficulty: 'medium',
        explanation: 'LEFT JOIN returns all records from the left table and matching records from the right.'
      },
      {
        id: 'cs-db-6',
        question: 'MongoDB is a type of:',
        options: ['Relational DB', 'Graph DB', 'NoSQL Document DB', 'Key-Value DB'],
        correct: 2,
        difficulty: 'medium',
        explanation: 'MongoDB is a NoSQL document-oriented database that stores data in JSON-like documents.'
      },
    ],
  },

  English: {
    Grammar: [
      {
        id: 'eng-gram-1',
        question: 'Which sentence is grammatically correct?',
        options: ['She don\'t like it.', 'She doesn\'t like it.', 'She doesn\'t likes it.', 'She not like it.'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'Third person singular uses "doesn\'t" + base form of verb.'
      },
      {
        id: 'eng-gram-2',
        question: 'Identify the type of noun in "honesty": ',
        options: ['Common Noun', 'Proper Noun', 'Abstract Noun', 'Collective Noun'],
        correct: 2,
        difficulty: 'easy',
        explanation: '"Honesty" is an abstract noun as it represents a quality/concept.'
      },
      {
        id: 'eng-gram-3',
        question: 'What is the past participle of "write"?',
        options: ['Wrote', 'Written', 'Writed', 'Writing'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'Write → Wrote (past) → Written (past participle)'
      },
      {
        id: 'eng-gram-4',
        question: '"Neither the teacher nor the students ___ present." Fill in the blank:',
        options: ['is', 'was', 'were', 'has been'],
        correct: 2,
        difficulty: 'medium',
        explanation: 'With "neither...nor", the verb agrees with the nearest subject ("students" = plural → "were").'
      },
      {
        id: 'eng-gram-5',
        question: 'Which sentence uses the subjunctive mood correctly?',
        options: ['If I was you', 'If I were you', 'If I am you', 'If I be you'],
        correct: 1,
        difficulty: 'medium',
        explanation: 'The subjunctive mood uses "were" for hypothetical situations: "If I were you".'
      },
      {
        id: 'eng-gram-6',
        question: 'Identify the figure of speech: "The wind whispered through the trees"',
        options: ['Simile', 'Metaphor', 'Personification', 'Hyperbole'],
        correct: 2,
        difficulty: 'hard',
        explanation: 'Personification gives human qualities (whispering) to a non-human entity (wind).'
      },
    ],
    Vocabulary: [
      {
        id: 'eng-vocab-1',
        question: 'What is a synonym for "ubiquitous"?',
        options: ['Rare', 'Omnipresent', 'Unique', 'Obsolete'],
        correct: 1,
        difficulty: 'medium',
        explanation: '"Ubiquitous" means present everywhere, synonym: omnipresent.'
      },
      {
        id: 'eng-vocab-2',
        question: 'What does "ephemeral" mean?',
        options: ['Lasting forever', 'Very large', 'Short-lived', 'Extremely old'],
        correct: 2,
        difficulty: 'medium',
        explanation: '"Ephemeral" means lasting for a very short time.'
      },
      {
        id: 'eng-vocab-3',
        question: 'The antonym of "benevolent" is:',
        options: ['Kind', 'Malevolent', 'Generous', 'Gracious'],
        correct: 1,
        difficulty: 'hard',
        explanation: 'Benevolent means kind/generous; malevolent means wishing harm.'
      },
      {
        id: 'eng-vocab-4',
        question: '"To burn the midnight oil" means:',
        options: ['To waste resources', 'To work late at night', 'To start a fire', 'To be angry'],
        correct: 1,
        difficulty: 'easy',
        explanation: 'This idiom means to work or study late into the night.'
      },
      {
        id: 'eng-vocab-5',
        question: 'What does "pragmatic" mean?',
        options: ['Idealistic', 'Theoretical', 'Practical', 'Dramatic'],
        correct: 2,
        difficulty: 'medium',
        explanation: '"Pragmatic" means dealing with things practically rather than theoretically.'
      },
    ],
  },
};

// Resource recommendations mapped to topics
export const resourceBank = {
  Mathematics: {
    Algebra: [
      { type: 'video', title: 'Algebra Basics - Khan Academy', url: 'https://www.khanacademy.org/math/algebra', rating: 4.8 },
      { type: 'article', title: 'Algebra Fundamentals Guide', url: 'https://www.mathsisfun.com/algebra/', rating: 4.5 },
      { type: 'practice', title: 'Algebra Practice Problems', url: 'https://www.purplemath.com/modules/', rating: 4.3 },
    ],
    Geometry: [
      { type: 'video', title: 'Geometry - Khan Academy', url: 'https://www.khanacademy.org/math/geometry', rating: 4.7 },
      { type: 'article', title: 'Geometry Visual Guide', url: 'https://www.mathsisfun.com/geometry/', rating: 4.4 },
      { type: 'practice', title: 'Geometry Interactive Problems', url: 'https://www.geogebra.org/', rating: 4.6 },
    ],
    Calculus: [
      { type: 'video', title: 'Calculus 1 - Professor Leonard', url: 'https://www.youtube.com/c/ProfessorLeonard', rating: 4.9 },
      { type: 'article', title: '3Blue1Brown - Essence of Calculus', url: 'https://www.3blue1brown.com/topics/calculus', rating: 4.9 },
      { type: 'practice', title: 'Calculus Practice - Paul\'s Online Notes', url: 'https://tutorial.math.lamar.edu/', rating: 4.7 },
    ],
  },
  Science: {
    Physics: [
      { type: 'video', title: 'Physics - Khan Academy', url: 'https://www.khanacademy.org/science/physics', rating: 4.6 },
      { type: 'article', title: 'HyperPhysics Concepts', url: 'http://hyperphysics.phy-astr.gsu.edu/', rating: 4.5 },
      { type: 'practice', title: 'Physics Classroom', url: 'https://www.physicsclassroom.com/', rating: 4.4 },
    ],
    Chemistry: [
      { type: 'video', title: 'Chemistry - Crash Course', url: 'https://www.youtube.com/crashcourse', rating: 4.7 },
      { type: 'article', title: 'LibreTexts Chemistry', url: 'https://chem.libretexts.org/', rating: 4.3 },
      { type: 'practice', title: 'ChemCollective Virtual Labs', url: 'http://chemcollective.org/', rating: 4.5 },
    ],
    Biology: [
      { type: 'video', title: 'Biology - Amoeba Sisters', url: 'https://www.youtube.com/AmoebaSisters', rating: 4.8 },
      { type: 'article', title: 'Biology LibreTexts', url: 'https://bio.libretexts.org/', rating: 4.4 },
      { type: 'practice', title: 'Biology Corner Activities', url: 'https://biologycorner.com/', rating: 4.2 },
    ],
  },
  'Computer Science': {
    'Data Structures': [
      { type: 'video', title: 'DSA - Abdul Bari', url: 'https://www.youtube.com/c/AbdulBari', rating: 4.9 },
      { type: 'article', title: 'GeeksforGeeks DSA', url: 'https://www.geeksforgeeks.org/data-structures/', rating: 4.6 },
      { type: 'practice', title: 'LeetCode Practice', url: 'https://leetcode.com/', rating: 4.8 },
    ],
    'Programming Basics': [
      { type: 'video', title: 'CS50 - Harvard', url: 'https://cs50.harvard.edu/', rating: 4.9 },
      { type: 'article', title: 'MDN Web Docs', url: 'https://developer.mozilla.org/', rating: 4.7 },
      { type: 'practice', title: 'freeCodeCamp', url: 'https://www.freecodecamp.org/', rating: 4.8 },
    ],
    Databases: [
      { type: 'video', title: 'Database Design - Caleb Curry', url: 'https://www.youtube.com/c/CalebCurry', rating: 4.5 },
      { type: 'article', title: 'W3Schools SQL Tutorial', url: 'https://www.w3schools.com/sql/', rating: 4.4 },
      { type: 'practice', title: 'SQLZoo Interactive', url: 'https://sqlzoo.net/', rating: 4.6 },
    ],
  },
  English: {
    Grammar: [
      { type: 'video', title: 'English Grammar - BBC Learning', url: 'https://www.bbc.co.uk/learningenglish', rating: 4.6 },
      { type: 'article', title: 'Grammarly Blog', url: 'https://www.grammarly.com/blog/', rating: 4.5 },
      { type: 'practice', title: 'Grammar Practice - English Page', url: 'https://www.englishpage.com/', rating: 4.3 },
    ],
    Vocabulary: [
      { type: 'video', title: 'Vocabulary Building - TED-Ed', url: 'https://ed.ted.com/', rating: 4.7 },
      { type: 'article', title: 'Vocabulary.com', url: 'https://www.vocabulary.com/', rating: 4.6 },
      { type: 'practice', title: 'Memrise - Vocabulary', url: 'https://www.memrise.com/', rating: 4.4 },
    ],
  },
};

// Badge definitions
export const badgeDefinitions = [
  { id: 'first_quiz', name: 'First Steps', description: 'Complete your first quiz', icon: '🎯', condition: (stats) => stats.totalQuizzes >= 1, xpReward: 50 },
  { id: 'five_quizzes', name: 'Quiz Explorer', description: 'Complete 5 quizzes', icon: '📚', condition: (stats) => stats.totalQuizzes >= 5, xpReward: 100 },
  { id: 'ten_quizzes', name: 'Knowledge Seeker', description: 'Complete 10 quizzes', icon: '🏆', condition: (stats) => stats.totalQuizzes >= 10, xpReward: 200 },
  { id: 'perfect_score', name: 'Perfect Score', description: 'Score 100% on a quiz', icon: '⭐', condition: (stats) => stats.perfectScores >= 1, xpReward: 150 },
  { id: 'streak_3', name: 'Hot Streak', description: 'Get 3 correct answers in a row', icon: '🔥', condition: (stats) => stats.maxStreak >= 3, xpReward: 75 },
  { id: 'streak_5', name: 'On Fire!', description: 'Get 5 correct answers in a row', icon: '💥', condition: (stats) => stats.maxStreak >= 5, xpReward: 150 },
  { id: 'streak_10', name: 'Unstoppable', description: 'Get 10 correct answers in a row', icon: '🚀', condition: (stats) => stats.maxStreak >= 10, xpReward: 300 },
  { id: 'multi_subject', name: 'Well Rounded', description: 'Attempt quizzes in 3 different subjects', icon: '🌍', condition: (stats) => stats.subjectsAttempted >= 3, xpReward: 200 },
  { id: 'fast_learner', name: 'Speed Demon', description: 'Answer 5 questions under 10 seconds each', icon: '⚡', condition: (stats) => stats.fastAnswers >= 5, xpReward: 100 },
  { id: 'xp_500', name: 'Rising Star', description: 'Earn 500 XP', icon: '✨', condition: (stats) => stats.totalXP >= 500, xpReward: 50 },
  { id: 'xp_1000', name: 'Scholar', description: 'Earn 1000 XP', icon: '🎓', condition: (stats) => stats.totalXP >= 1000, xpReward: 100 },
  { id: 'xp_2500', name: 'Grandmaster', description: 'Earn 2500 XP', icon: '👑', condition: (stats) => stats.totalXP >= 2500, xpReward: 250 },
  { id: 'hard_master', name: 'Challenge Master', description: 'Score 80%+ on a hard difficulty quiz', icon: '💎', condition: (stats) => stats.hardQuizHighScore >= 80, xpReward: 200 },
  { id: 'daily_login_7', name: 'Dedicated', description: 'Log in 7 days in a row', icon: '📅', condition: (stats) => stats.loginStreak >= 7, xpReward: 150 },
];

export default quizData;
