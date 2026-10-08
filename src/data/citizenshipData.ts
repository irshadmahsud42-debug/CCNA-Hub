import { PhishingEmail, PrivacyItem, UpstanderDilemma } from '../types';

export const PHISHING_EMAILS: PhishingEmail[] = [
  {
    id: 'phish-1',
    senderName: 'Roblox Rewards Admin',
    senderEmail: 'support@roblox-free-coins-bonus99.biz',
    subject: 'CLAIM 5,000 FREE ROBUX TODAY ONLY! (Expires in 2 hours)',
    date: 'Today, 3:45 PM',
    content: `CONGRATULATIONS GAMER!

Your account has been selected in our annual Golden Drop. We are sending 5,000 Robux directly to your profile.

To claim right now, click the button below and enter your username and account password to verify ownership. If you do not claim within 2 hours, your bonus will be forfeited forever!

[CLICK HERE TO CLAIM YOUR FREE BONUS]

- The Robux Team`,
    isPhishing: true,
    redFlags: [
      'Suspicious sender email address (@roblox-free-coins-bonus99.biz instead of @roblox.com)',
      'Artificial urgency ("Expires in 2 hours!") designed to make you panic and skip critical thinking',
      'Asks for your private account password (legitimate companies will NEVER ask for your password in an email)',
      '"Too good to be true" offer of free gaming currency',
    ],
    educationalTakeaway: 'Scammers frequently dangle free gaming currency (Robux, V-Bucks, Minecoins) to trick students into surrendering their passwords. Never enter passwords on links received through email or Discord.',
  },
  {
    id: 'phish-2',
    senderName: 'Lincoln Middle School Library',
    senderEmail: 'library@lincolnmiddleschool.edu',
    subject: 'Overdue Book Reminder: "Percy Jackson & The Lightning Thief"',
    date: 'Yesterday, 8:15 AM',
    content: `Dear Student,

Our records indicate that the library book "Percy Jackson & The Lightning Thief" checked out to your student ID was due on Friday.

Please return it to the book return drop box outside Room 204 or stop by during advisory period to renew it for another two weeks. No overdue fees are charged.

Have a great week!
Mrs. Hernandez, Head Librarian
Lincoln Middle School`,
    isPhishing: false,
    redFlags: [],
    educationalTakeaway: 'This email is authentic. The sender address is an official verified school domain (.edu), contains specific library details, does not ask for sensitive credentials or money, and includes no high-pressure threats.',
  },
  {
    id: 'phish-3',
    senderName: 'Instagram Security Center',
    senderEmail: 'security-alert@insta-helpdesk-verify-account.info',
    subject: 'URGENT: Copyright Violation Warning - Account Deletion Scheduled',
    date: 'Today, 1:12 PM',
    content: `Attention User,

Your account has been reported for multiple copyright infringements on your recent reel. Due to Digital Millennium Copyright Act regulations, your account will be permanently banned within 24 hours.

If you believe this is an error, submit an appeal immediately by clicking below and confirming your phone number and current 2-factor authentication code.

[VERIFY & PREVENT DELETION]`,
    isPhishing: true,
    redFlags: [
      'Fake domain (.info helpdesk instead of official instagram.com)',
      'Threatening tone threatening permanent account deletion within 24 hours',
      'Asks for two-factor authentication (2FA) verification code to hijack account access',
    ],
    educationalTakeaway: 'Fear is the #1 tactic scammers use. They threaten account bans so you act quickly without checking the sender URL. Real security alerts are posted in the app settings under Account Status, not via external emails.',
  },
  {
    id: 'phish-4',
    senderName: 'Science Department (Mr. Davis)',
    senderEmail: 'jdavis@lincolnmiddleschool.edu',
    subject: 'Grade 8 Science Fair Guidelines and Rubric PDF',
    date: 'Monday, 10:30 AM',
    content: `Hi Class,

Attached is the project rubric and presentation schedule for next week's Science Fair showcase in the gym.

Please review the judging criteria with your project partner before Friday's lab session. Let me know if you need any extra poster boards or beakers.

Best regards,
Mr. Davis
Lincoln Middle School, Room 112`,
    isPhishing: false,
    redFlags: [],
    educationalTakeaway: 'Authentic school communication from a recognized teacher email address with realistic classroom context, polite tone, and no suspicious links or credential requests.',
  },
  {
    id: 'phish-5',
    senderName: 'Jake (Your Classmate)',
    senderEmail: 'jake.wilson.private772@fastmail-secure.net',
    subject: 'HELP ME!! Emergency, don\'t tell my parents',
    date: 'Today, 4:10 PM',
    content: `Hey! It's Jake from 3rd period algebra. I am stranded at the mall and my phone battery is dying. My mom is at work and can't pick up.

Can you please quickly buy a $25 Apple Gift Card from the store near your house and text me the code on the back so I can get a ride home? I'll pay you back double tomorrow in class! Please don't call my mom she'll be super mad.`,
    isPhishing: true,
    redFlags: [
      'Gift card request — legitimate people and emergency services never ask for gift cards as payment',
      'Suspicious email address claiming to be a classmate you see daily',
      'Explicit plea for secrecy ("don\'t tell my parents", "don\'t call")',
    ],
    educationalTakeaway: 'Impersonation scams target your sympathy and friendships. If someone asks for gift cards, money, or codes while urging secrecy, talk to an adult immediately and contact your friend through verified channels.',
  },
];

export const PRIVACY_ITEMS: PrivacyItem[] = [
  {
    id: 'p-1',
    title: 'Your Gamer Tag / Username',
    example: 'CosmicCoder_42 or PixelKnight',
    isSafeToSharePublicly: true,
    explanation: 'Creative pseudonyms that don\'t contain your real full name, birth year, or school are safe to share in online gaming and learning communities.',
  },
  {
    id: 'p-2',
    title: 'Your Home Street Address',
    example: '742 Evergreen Terrace, Springfield',
    isSafeToSharePublicly: false,
    explanation: 'Never post your physical home address or street name. Physical locations can be used to track where you and your family live.',
  },
  {
    id: 'p-3',
    title: 'Live Real-Time GPS Location at School or Practice',
    example: '"Practicing at West Field until 6 PM with nobody around!"',
    isSafeToSharePublicly: false,
    explanation: 'Sharing your exact real-time schedule and lone location tells strangers exactly where to find you and when your house might be empty.',
  },
  {
    id: 'p-4',
    title: 'Your Favorite Coding Project or Artwork',
    example: 'A drawing of a robot or a Scratch game you programmed',
    isSafeToSharePublicly: true,
    explanation: 'Creative work you made is great to showcase in student portfolios, provided it doesn\'t contain personal contact details.',
  },
  {
    id: 'p-5',
    title: 'Answers to Security Questions (Pet name, Mother\'s maiden name)',
    example: '"My first pet was named Sparky and I was born in Denver!"',
    isSafeToSharePublicly: false,
    explanation: 'Trendy social media quizzes like "What\'s your retro name? (First pet + birthplace)" are often designed to steal password reset answers!',
  },
  {
    id: 'p-6',
    title: 'Your Full Name, School Name, and Grade',
    example: 'Emily Rose Taylor, Lincoln Middle Grade 8 Room 204',
    isSafeToSharePublicly: false,
    explanation: 'Piecing together full names and specific schools enables strangers to impersonate teachers, family friends, or school staff.',
  },
];

export const UPSTANDER_DILEMMAS: UpstanderDilemma[] = [
  {
    id: 'dilemma-1',
    title: 'The Group Chat Roast',
    context: 'A private group chat with 8 classmates from your school project team.',
    scenario: 'Two students start posting embarrassing edited photos of a classmate named Sam who isn\'t in the chat, calling him names and encouraging others to drop mean emojis.',
    choices: [
      {
        text: 'Join in with a laughing emoji so you don\'t become the next target.',
        isBestPractice: false,
        feedback: 'Joining in fuels the fire and makes the targeted student feel even more isolated. Peer pressure can be scary, but laughing empowers bullies.',
        impactScore: -10,
      },
      {
        text: 'Ignore it and mute notifications completely without saying anything.',
        isBestPractice: false,
        feedback: 'While staying silent is better than contributing, silence acts as a passive bystander. Bullying continues when nobody speaks up.',
        impactScore: 5,
      },
      {
        text: 'Speak up in the chat: "Not cool guys, let\'s keep this project related," take a screenshot, and check in on Sam privately.',
        isBestPractice: true,
        feedback: 'True Upstander behavior! Setting a boundary shifts group norms, screenshots preserve evidence if needed, and reaching out to Sam shows real empathy.',
        impactScore: 25,
      },
    ],
  },
  {
    id: 'dilemma-2',
    title: 'The Gaming Lobby Mic Harassment',
    context: 'In an online multiplayer team game with open voice chat.',
    scenario: 'A younger player on your squad misses an objective. An older teammate starts screaming insults, calling them derogatory names, and threatening to boot them.',
    choices: [
      {
        text: 'Mute the toxic player, tell the younger player "Nice try, we got the next round," and report the harasser using the in-game reporting tool.',
        isBestPractice: true,
        feedback: 'Outstanding response. Deprives the harasser of an audience, protects the victim\'s morale, and uses platform moderation to keep gaming communities safe.',
        impactScore: 25,
      },
      {
        text: 'Turn on your mic and scream insults back at the bully to defend your squad.',
        isBestPractice: false,
        feedback: 'Fighting toxicity with toxicity usually escalates the aggression and risks getting your own account banned by moderators.',
        impactScore: 0,
      },
      {
        text: 'Leave the game immediately without reporting.',
        isBestPractice: false,
        feedback: 'Leaving gets you out of the situation, but leaves the bully free to target other young players in future matches.',
        impactScore: 5,
      },
    ],
  },
  {
    id: 'dilemma-3',
    title: 'AI Homework & Copyright Ethics',
    context: 'A middle school research report on space exploration.',
    scenario: 'Your project partner copy-pastes an entire paragraph generated by an AI tool and says, "Let\'s just turn this in as our original writing; the teacher will never know."',
    choices: [
      {
        text: 'Turn it in as is and take the free high grade.',
        isBestPractice: false,
        feedback: 'Passing off AI-generated writing or another author\'s text as your own is academic dishonesty (plagiarism). It also cheats you out of learning how to write and think.',
        impactScore: -15,
      },
      {
        text: 'Use the AI summary as an initial brainstorming guide, verify the facts with real books or NASA sources, and rewrite the explanation in your own words with proper citations.',
        isBestPractice: true,
        feedback: 'Spot-on ethical digital citizenship! AI is a powerful brainstorming partner, but you must verify facts (AI can hallucinate) and write in your own authentic voice.',
        impactScore: 25,
      },
      {
        text: 'Delete their part and tell the teacher your partner did zero work without discussing it first.',
        isBestPractice: false,
        feedback: 'Communication comes first. Explaining academic ethics to your partner gives them a chance to fix it together before escalating.',
        impactScore: 5,
      },
    ],
  },
];
