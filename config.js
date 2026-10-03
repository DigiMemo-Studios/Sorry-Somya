// DigiMemo Configuration
// Edit this file to customize the content, styles, music, and layout of your interactive story!

const websiteData = {
  // Global Web App Settings
  title: "I’m Sorry... ❤️",
  subtitle: "A message straight from my heart",
  songUrl: "saibo.webm", // Saibo video audio track
  musicAutoplay: false,
  
  // Theme styling (Soft apologies pastel theme: lavender & blush pink)
  primaryColor: "#ff85a2", // Soft blush pink
  secondaryColor: "#a29bfe", // Soft lavender
  accentColor: "#ff7675", // Soft red
  
  // Choose default global character theme: "bunny", "bear", "kitten", "panda", "hamster"
  characterTheme: "panda", 

  // Card background styling
  cardGradient: "linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(255, 240, 245, 0.9))",

  // Website flow pages
  pages: [
    {
      type: "story",
      character: "panda",
      expression: "sad",
      bubbleText: "Hi... 🥺",
      message: "Pta h shyd m kabhi-kabhi choti si baat ko bhi bht zyada soch leti hu aur fr usi ke chkkr me tumse ase baat kr deti hu jo nhi krni chahiye.",
      buttonText: "Read more... 🥺"
    },
    {
      type: "story",
      character: "panda",
      expression: "crying",
      bubbleText: "Genuinely sorry... 😭",
      message: "Jo bhi hua uske liye genuinely sorry. Mera intention tumse ladna ya tumhe hurt krna kabhi nhi hota, bas kabhi-kabhi meri feelings mujhse handle nhi hoti.",
      buttonText: "Go on... ❤️"
    },
    {
      type: "letter",
      character: "panda",
      expression: "shy",
      bubbleText: "From my heart ✉️❤️",
      message: "Please open this small letter. I put my whole heart into writing this for you.",
      envelopeLabel: "Tap to read my message 💖",
      letterContent: "I’m Sorry ❤️\n\nPta h shyd m kabhi-kabhi choti si baat ko bhi bht zyada soch leti hu aur fr usi ke chkkr me tumse ase baat kr deti hu jo nhi krni chahiye. Jo bhi hua uske liye genuinely sorry. Mera intention tumse ladna ya tumhe hurt krna kabhi nhi hota, bas kabhi-kabhi meri feelings mujhse handle nhi hoti.\n\nMerko perfect kuch nhi chahiye, bas hum thik chahiye.\nThodi nok-jhok ho, thodi problems ho, but end me hm dono saath ho, bas. 🫶🏻\n\nAur pta h, m har baar sahi tareeke se express nhi kr pati, but tum mere liye bht important ho. ❤️\n\nI love you, aur m nhi chahti ki meri overthinking ki wajah se humare beech kuch bhi kharab ho. 🫂",
      buttonText: "Our Memories 📸"
    },
    {
      type: "photos",
      character: "panda",
      expression: "hugging",
      bubbleText: "Our Memories 📸",
      message: "Merko perfect kuch nhi chahiye, bas hum thik chahiye. Thodi nok-jhok ho, thodi problems ho, but end me hm dono saath ho, bas. 🫶🏻",
      photos: [
        {
          url: "picture1.jpg",
          caption: "Picture 1 💕"
        },
        {
          url: "picture2.jpg",
          caption: "Picture 2 😊"
        },
        {
          url: "picture3.jpg",
          caption: "Picture 3 🫶🏻"
        }
      ],
      buttonText: "One last thing... 🥺"
    },
    {
      type: "question",
      character: "panda",
      expression: "shy",
      bubbleText: "Do you forgive me? 🥺",
      message: "I love you, aur m nhi chahti ki meri overthinking ki wajah se humare beech kuch bhi kharab ho. 🫂❤️",
      yesButtonText: "Yes, I forgive you! 🥰",
      noButtonText: "No! 😤",
      noRunawayCount: 6,
      noRunawayDialogues: [
        "Wait, please? 🥺",
        "Hum thik ho jayein bas? 🫶🏻",
        "Pretty please? 🍒",
        "Don't be mad at me... 😭",
        "I love you so much! ❤️",
        "Okay, last chance! 🥺"
      ],
      noClickSadResponse: "Fine, you clicked No... But I still love you with all my heart! 🥺❤️"
    }
  ],

  // Final Celebration/Ending Screen
  ending: {
    character: "panda",
    expression: "excited",
    bubbleText: "Yay! 🎉❤️",
    message: "Thank you for forgiving me! You mean the absolute world to me. I promise to cherish us every single day! 🫂❤️✨",
    replayButtonText: "Replay ❤️",
    screenshotButtonText: "Save Memo 📸"
  }
};
