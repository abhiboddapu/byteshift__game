import { QuizQuestion } from '../types/game';

export const IT_QUIZ_BANK: QuizQuestion[] = [
  // Level 1: Hardware & Basics (difficulty 1)
  {
    id: 'hw-1',
    topic: 'Hardware & Basics',
    difficulty: 1,
    question: 'What does CPU stand for in computing?',
    options: [
      'Central Processing Unit',
      'Computer Personal Unit',
      'Core Program Utility',
      'Central Power Unit',
    ],
    correctIndex: 0,
    explanation: 'The CPU (Central Processing Unit) executes instructions and acts as the brain of the computer.',
  },
  {
    id: 'hw-2',
    topic: 'Hardware & Basics',
    difficulty: 1,
    question: 'Which memory loses all stored data when the computer is turned off?',
    options: ['SSD', 'RAM', 'USB Flash Drive', 'Hard Disk Drive'],
    correctIndex: 1,
    explanation: 'RAM (Random Access Memory) is volatile memory that clears when power is lost.',
  },
  {
    id: 'hw-3',
    topic: 'Hardware & Basics',
    difficulty: 1,
    question: 'How many bits make up one byte?',
    options: ['4 bits', '8 bits', '16 bits', '32 bits'],
    correctIndex: 1,
    explanation: 'One byte consists of 8 bits, enough to represent 256 distinct values.',
  },
  {
    id: 'hw-4',
    topic: 'Hardware & Basics',
    difficulty: 1,
    question: 'Which of these is an output device?',
    options: ['Keyboard', 'Mouse', 'Monitor', 'Microphone'],
    correctIndex: 2,
    explanation: 'A monitor displays visual information from the computer to the user.',
  },
  {
    id: 'hw-5',
    topic: 'Hardware & Basics',
    difficulty: 1,
    question: 'What does USB stand for?',
    options: [
      'Universal Serial Bus',
      'Unified System Board',
      'Ultra Speed Bridge',
      'User Storage Bank',
    ],
    correctIndex: 0,
    explanation: 'USB stands for Universal Serial Bus, the standard connector for peripherals.',
  },
  {
    id: 'hw-6',
    topic: 'Hardware & Basics',
    difficulty: 1,
    question: 'Which type of storage drive has no moving mechanical parts?',
    options: ['HDD', 'Floppy Disk', 'SSD', 'DVD-ROM'],
    correctIndex: 2,
    explanation: 'An SSD (Solid State Drive) uses flash memory chips instead of spinning platters.',
  },
  {
    id: 'hw-7',
    topic: 'Hardware & Basics',
    difficulty: 1,
    question: 'In binary code, what are the only two digits used?',
    options: ['1 and 2', '0 and 1', '0 and 9', 'A and B'],
    correctIndex: 1,
    explanation: 'Binary is a base-2 number system built entirely from 0s and 1s.',
  },
  {
    id: 'hw-8',
    topic: 'Hardware & Basics',
    difficulty: 1,
    question: 'Which component is mainly responsible for rendering 3D graphics?',
    options: ['GPU', 'PSU', 'NIC', 'BIOS'],
    correctIndex: 0,
    explanation: 'The GPU (Graphics Processing Unit) specializes in parallel image and 3D rendering.',
  },

  // Level 2: Web & Internet (difficulty 1-2)
  {
    id: 'web-1',
    topic: 'Web & Internet',
    difficulty: 1,
    question: 'What does HTTP stand for?',
    options: [
      'HyperText Transfer Protocol',
      'High Tech Transmission Path',
      'Host Tracking Text Page',
      'Hyperlink Terminal Transport',
    ],
    correctIndex: 0,
    explanation: 'HTTP is the HyperText Transfer Protocol used to load web pages.',
  },
  {
    id: 'web-2',
    topic: 'Web & Internet',
    difficulty: 1,
    question: 'Which language gives a web page its basic structure?',
    options: ['Python', 'HTML', 'SQL', 'C++'],
    correctIndex: 1,
    explanation: 'HTML (HyperText Markup Language) defines headings, paragraphs, and elements on a page.',
  },
  {
    id: 'web-3',
    topic: 'Web & Internet',
    difficulty: 1,
    question: 'What does the "S" in HTTPS mean?',
    options: ['Simple', 'Speedy', 'Secure', 'Server'],
    correctIndex: 2,
    explanation: 'HTTPS adds TLS encryption so data between your browser and the site stays private.',
  },
  {
    id: 'web-4',
    topic: 'Web & Internet',
    difficulty: 1,
    question: 'What does URL stand for?',
    options: [
      'Universal Routing Link',
      'Uniform Resource Locator',
      'User Reference Label',
      'Unified Relay Line',
    ],
    correctIndex: 1,
    explanation: 'A URL (Uniform Resource Locator) is the web address of a page or file.',
  },
  {
    id: 'web-5',
    topic: 'Web & Internet',
    difficulty: 2,
    question: 'What is the main job of DNS on the internet?',
    options: [
      'Block computer viruses',
      'Translate domain names into IP addresses',
      'Compress large video files',
      'Speed up Wi-Fi signals',
    ],
    correctIndex: 1,
    explanation: 'DNS acts like the internet phonebook, turning names like example.com into IP addresses.',
  },
  {
    id: 'web-6',
    topic: 'Web & Internet',
    difficulty: 2,
    question: 'Which HTTP status code means "Page Not Found"?',
    options: ['200', '301', '404', '500'],
    correctIndex: 2,
    explanation: 'Status 404 indicates the requested resource could not be found on the server.',
  },
  {
    id: 'web-7',
    topic: 'Web & Internet',
    difficulty: 1,
    question: 'Which technology styles the colors, fonts, and layout of a website?',
    options: ['CSS', 'JSON', 'DNS', 'FTP'],
    correctIndex: 0,
    explanation: 'CSS (Cascading Style Sheets) controls the visual presentation of HTML elements.',
  },
  {
    id: 'web-8',
    topic: 'Web & Internet',
    difficulty: 2,
    question: 'What is a browser "cookie" primarily used for?',
    options: [
      'Cooling down the CPU',
      'Remembering small bits of user state like logins',
      'Formatting hard drives',
      'Boosting monitor brightness',
    ],
    correctIndex: 1,
    explanation: 'Cookies store small key-value data in your browser to keep sessions and preferences.',
  },

  // Level 3: Operating Systems & Productivity (difficulty 2)
  {
    id: 'os-1',
    topic: 'Operating Systems',
    difficulty: 1,
    question: 'Which keyboard shortcut copies selected text on Windows and Linux?',
    options: ['Ctrl + V', 'Ctrl + X', 'Ctrl + C', 'Ctrl + Z'],
    correctIndex: 2,
    explanation: 'Ctrl + C copies the selection to the clipboard without removing it.',
  },
  {
    id: 'os-2',
    topic: 'Operating Systems',
    difficulty: 1,
    question: 'What does Ctrl + Z (or Cmd + Z) usually do?',
    options: ['Zoom in', 'Undo the last action', 'Close the window', 'Save the file'],
    correctIndex: 1,
    explanation: 'Ctrl + Z / Cmd + Z is the universal shortcut to undo your most recent change.',
  },
  {
    id: 'os-3',
    topic: 'Operating Systems',
    difficulty: 2,
    question: 'Which operating system is open-source and powers most web servers?',
    options: ['Windows 11', 'macOS', 'Linux', 'iOS'],
    correctIndex: 2,
    explanation: 'Linux is open-source and widely used across cloud servers, containers, and supercomputers.',
  },
  {
    id: 'os-4',
    topic: 'Operating Systems',
    difficulty: 2,
    question: 'What does a ".zip" file extension indicate?',
    options: [
      'A high-definition video',
      'A compressed archive of files',
      'An audio recording',
      'A system font',
    ],
    correctIndex: 1,
    explanation: 'ZIP files bundle and compress one or more files to save space and simplify sharing.',
  },
  {
    id: 'os-5',
    topic: 'Operating Systems',
    difficulty: 2,
    question: 'What is the core component of an operating system called?',
    options: ['Shell', 'Kernel', 'Browser', 'Compiler'],
    correctIndex: 1,
    explanation: 'The kernel manages CPU scheduling, memory, and hardware communication.',
  },
  {
    id: 'os-6',
    topic: 'Operating Systems',
    difficulty: 1,
    question: 'Which file format preserves layout and looks identical across devices?',
    options: ['.txt', '.pdf', '.csv', '.wav'],
    correctIndex: 1,
    explanation: 'PDF (Portable Document Format) keeps fonts, images, and page layout consistent everywhere.',
  },

  // Level 4: Cybersecurity & Networking (difficulty 2-3)
  {
    id: 'sec-1',
    topic: 'Cybersecurity',
    difficulty: 1,
    question: 'What is "phishing" in cybersecurity?',
    options: [
      'Upgrading Wi-Fi firmware',
      'Tricking users into sharing passwords via fake messages',
      'Scanning a disk for bad sectors',
      'Encrypting backup drives',
    ],
    correctIndex: 1,
    explanation: 'Phishing uses deceptive emails or sites disguised as trusted brands to steal credentials.',
  },
  {
    id: 'sec-2',
    topic: 'Cybersecurity',
    difficulty: 2,
    question: 'What does 2FA stand for?',
    options: [
      'Two-File Archive',
      'Two-Factor Authentication',
      'Twin Firewall Access',
      'Transfer Format Algorithm',
    ],
    correctIndex: 1,
    explanation: 'Two-Factor Authentication adds a second check, such as a phone code, beyond your password.',
  },
  {
    id: 'sec-3',
    topic: 'Cybersecurity',
    difficulty: 2,
    question: 'What is the main purpose of a network firewall?',
    options: [
      'Increase monitor refresh rate',
      'Filter incoming and outgoing network traffic by rules',
      'Defragment solid-state drives',
      'Charge laptop batteries faster',
    ],
    correctIndex: 1,
    explanation: 'A firewall monitors and blocks unauthorized network traffic based on security rules.',
  },
  {
    id: 'sec-4',
    topic: 'Cybersecurity',
    difficulty: 2,
    question: 'What does VPN stand for?',
    options: [
      'Virtual Private Network',
      'Verified Public Node',
      'Visual Packet Navigator',
      'Variable Port Number',
    ],
    correctIndex: 0,
    explanation: 'A Virtual Private Network creates an encrypted tunnel for your internet traffic.',
  },
  {
    id: 'sec-5',
    topic: 'Cybersecurity',
    difficulty: 2,
    question: 'Which password habit is safest?',
    options: [
      'Using "123456" everywhere',
      'Reusing one strong password across all accounts',
      'Using unique, long passphrases per site',
      'Sharing your password in plain text',
    ],
    correctIndex: 2,
    explanation: 'Unique, long passwords prevent a breach on one site from compromising your other accounts.',
  },
  {
    id: 'sec-6',
    topic: 'Cybersecurity',
    difficulty: 3,
    question: 'What is an IP address used for?',
    options: [
      'Measuring screen pixels',
      'Identifying a device on a network',
      'Formatting spreadsheet cells',
      'Installing printer ink',
    ],
    correctIndex: 1,
    explanation: 'An IP (Internet Protocol) address uniquely identifies devices so packets reach the right place.',
  },

  // Level 5+: Coding & Data (difficulty 2-3)
  {
    id: 'code-1',
    topic: 'Coding & Data',
    difficulty: 2,
    question: 'Which data type stores only true or false values?',
    options: ['Integer', 'String', 'Boolean', 'Float'],
    correctIndex: 2,
    explanation: 'A Boolean variable holds one of two truth values: true or false.',
  },
  {
    id: 'code-2',
    topic: 'Coding & Data',
    difficulty: 2,
    question: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Quick Logic',
      'System Queue Loader',
      'Sequential Question List',
    ],
    correctIndex: 0,
    explanation: 'SQL (Structured Query Language) is used to query and manage relational databases.',
  },
  {
    id: 'code-3',
    topic: 'Coding & Data',
    difficulty: 2,
    question: 'What is a "bug" in software development?',
    options: [
      'A computer mouse cable',
      'An error or flaw that causes unexpected behavior',
      'A type of high-speed monitor',
      'A cloud backup folder',
    ],
    correctIndex: 1,
    explanation: 'A software bug is a mistake in code or logic that makes a program behave incorrectly.',
  },
  {
    id: 'code-4',
    topic: 'Coding & Data',
    difficulty: 2,
    question: 'What does API stand for?',
    options: [
      'Automated Page Index',
      'Application Programming Interface',
      'Active Protocol Inspector',
      'Array Pointer Integer',
    ],
    correctIndex: 1,
    explanation: 'An API defines how different software programs communicate and exchange data.',
  },
  {
    id: 'code-5',
    topic: 'Coding & Data',
    difficulty: 3,
    question: 'In most programming languages, what is the index of the first item in an array?',
    options: ['0', '1', '-1', '10'],
    correctIndex: 0,
    explanation: 'Most modern languages (JS, Python, C, Java) use zero-based indexing starting at 0.',
  },
  {
    id: 'code-6',
    topic: 'Coding & Data',
    difficulty: 2,
    question: 'Which tool is widely used by developers to track code changes and collaborate?',
    options: ['Git', 'Paint', 'BIOS', 'Ping'],
    correctIndex: 0,
    explanation: 'Git is a distributed version control system for tracking history and team collaboration.',
  },
  {
    id: 'code-7',
    topic: 'Coding & Data',
    difficulty: 3,
    question: 'What format uses key-value pairs like {"name": "Alex"} to exchange web data?',
    options: ['PNG', 'JSON', 'MP3', 'SVG'],
    correctIndex: 1,
    explanation: 'JSON (JavaScript Object Notation) is a lightweight, human-readable data interchange format.',
  },
  {
    id: 'code-8',
    topic: 'Coding & Data',
    difficulty: 3,
    question: 'What does "RAM" speed or "CPU" clock speed commonly get measured in?',
    options: ['Watts', 'Gigahertz (GHz)', 'Lumens', 'Pixels'],
    correctIndex: 1,
    explanation: 'Clock speed is measured in Hertz—modern processors run at billions of cycles per second (GHz).',
  },
];

const LEVEL_TOPIC_ORDER: QuizQuestion['topic'][] = [
  'Hardware & Basics',
  'Web & Internet',
  'Operating Systems',
  'Cybersecurity',
  'Coding & Data',
];

export function pickQuizQuestion(level: number, usedIds: Set<string>): QuizQuestion {
  const preferredTopic = LEVEL_TOPIC_ORDER[(level - 1) % LEVEL_TOPIC_ORDER.length];
  let pool = IT_QUIZ_BANK.filter(
    (q) => q.topic === preferredTopic && !usedIds.has(q.id)
  );

  if (pool.length === 0) {
    pool = IT_QUIZ_BANK.filter((q) => !usedIds.has(q.id));
  }

  if (pool.length === 0) {
    // All questions used: reset gracefully while picking preferred topic
    pool = IT_QUIZ_BANK.filter((q) => q.topic === preferredTopic);
    if (pool.length === 0) {
      pool = IT_QUIZ_BANK;
    }
  }

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return chosen;
}
