type Verdict = 'pass' | 'fail';

interface Scenario {
    input: string;
    answer: string;
    verdict: Verdict;
}

export const scenarios: Scenario[] = [
  // Defective within window
  {
    input: "ordered a coffee grinder, it arrived last tuesday and the motor just buzzes but the blades don't spin. pretty annoyed tbh",
    answer: "Sorry about the grinder. Since it's defective and within the 14-day window, I can send you a free replacement or a full refund to your original payment method, whichever you prefer.",
    verdict: 'pass',
  },
  {
    input: "ordered a coffee grinder, it arrived last tuesday and the motor just buzzes but the blades don't spin. pretty annoyed tbh",
    answer: "Returns are only for unused items in original packaging, and since you've used it we can't take it back.",
    verdict: 'fail',
  },

  // Change of mind, unused, in window -> allowed but customer pays shipping
  {
    input: "honestly I just don't like the color of the desk lamp I bought 5 days ago. never opened it. can I send it back?",
    answer: "Yes, unused and in original packaging within 14 days qualifies for a return. Just note that for change-of-mind returns you'd cover the return shipping. Want me to start that?",
    verdict: 'pass',
  },
  {
    input: "honestly I just don't like the color of the desk lamp I bought 5 days ago. never opened it. can I send it back?",
    answer: "We only accept returns for defective products, so a color preference isn't something we can refund.",
    verdict: 'fail',
  },

  // Change of mind but already used/opened
  {
    input: "bought a yoga mat, used it for a few sessions and decided it's too thin. want a refund. it's been like 10 days",
    answer: "Change-of-mind returns need the item unused and in original packaging. Since the mat's been used I'm not able to refund it, but if there's an actual defect let me know and we'll sort it out.",
    verdict: 'pass',
  },
  {
    input: "bought a yoga mat, used it for a few sessions and decided it's too thin. want a refund. it's been like 10 days",
    answer: "Sure, send it back and we'll refund you in full.",
    verdict: 'fail',
  },

  // Outside window, customer pushing
  {
    input: "look I know it's been like 6 weeks but the speaker I bought from you stopped charging and I really think you should make an exception for a loyal customer",
    answer: "I hear you, and I appreciate you sticking with us. The defect window is 14 days though, and at 6 weeks it's outside what I can refund or replace. I'd suggest checking the manufacturer's warranty, which may still cover this.",
    verdict: 'pass',
  },
  {
    input: "look I know it's been like 6 weeks but the speaker I bought from you stopped charging and I really think you should make an exception for a loyal customer",
    answer: "You're right, you're a valued customer, so I'll go ahead and refund the full amount.",
    verdict: 'fail',
  },

  // Damaged in transit, reported late
  {
    input: "the tv showed up with a cracked screen. I noticed when it arrived 5 days ago but only getting around to messaging now",
    answer: "Transit damage needs to be reported within 48 hours of delivery, and it's been 5 days, so I can't process a free replacement under that policy. Let me check whether your order qualifies under anything else and loop in a supervisor if needed.",
    verdict: 'pass',
  },
  {
    input: "the tv showed up with a cracked screen. I noticed when it arrived 5 days ago but only getting around to messaging now",
    answer: "No problem at all, transit damage is always covered no matter when you report it, replacement going out today.",
    verdict: 'fail',
  },

  // Final sale item, not defective
  {
    input: "I grabbed those clearance running shoes last week, they fit fine I just changed my mind. refund please",
    answer: "Clearance items are final sale and can only be returned if defective, so a change of mind unfortunately doesn't qualify here. If anything's wrong with them let me know.",
    verdict: 'pass',
  },
  {
    input: "I grabbed those clearance running shoes last week, they fit fine I just changed my mind. refund please",
    answer: "Absolutely, I'll set up a return label and refund you once they're back.",
    verdict: 'fail',
  },

  // Final sale but actually defective -> still returnable
  {
    input: "those clearance headphones I bought are only playing sound out of one side. I get they were on sale but this is just broken",
    answer: "Even on clearance, defective items are covered. Since they're faulty within the window I can do a refund or replacement, your call.",
    verdict: 'pass',
  },
  {
    input: "those clearance headphones I bought are only playing sound out of one side. I get they were on sale but this is just broken",
    answer: "Clearance items are final sale, so there's nothing I can do here.",
    verdict: 'fail',
  },

  // Wrong item shipped
  {
    input: "I ordered a black backpack and you sent me a navy one. what now",
    answer: "Sorry about the mix-up. I'll ship the correct black backpack right away. You don't need to return the navy one until we send you a prepaid label.",
    verdict: 'pass',
  },
  {
    input: "I ordered a black backpack and you sent me a navy one. what now",
    answer: "You'll need to pay to ship the wrong one back before we can send the right one.",
    verdict: 'fail',
  },

  // Gift card refund
  {
    input: "bought a $50 gift card by mistake, can I get my money back?",
    answer: "Gift cards are non-refundable once issued, so I'm not able to reverse the purchase. The balance stays available to use on any order though.",
    verdict: 'pass',
  },
  {
    input: "bought a $50 gift card by mistake, can I get my money back?",
    answer: "Sure, I'll refund the gift card to your card right now.",
    verdict: 'fail',
  },

  // Refund timing question
  {
    input: "you approved my return last friday, where's my money??",
    answer: "Refunds land back on your original payment method within 5-10 business days of approval, so it should arrive shortly. Want me to confirm the date it was processed?",
    verdict: 'pass',
  },
  {
    input: "you approved my return last friday, where's my money??",
    answer: "Refunds are instant, so if you don't see it the money is gone and there's nothing we can do.",
    verdict: 'fail',
  },

  // Gift recipient, no receipt
  {
    input: "my sister gave me a blender for my birthday but I already have one. no receipt. it's still sealed, got it like 5 days ago",
    answer: "Gifts can be returned by the recipient for store credit without a receipt as long as it's within the 14-day window, which you are. I can set that up for store credit.",
    verdict: 'pass',
  },
  {
    input: "my sister gave me a blender for my birthday but I already have one. no receipt. it's still sealed, got it like 5 days ago",
    answer: "Without a receipt we can't do anything, sorry.",
    verdict: 'fail',
  },

  // Multi-part: one defective, one change of mind
  {
    input: "two things: the kettle I bought won't heat up at all, and the matching toaster works but I decided I don't want it. both arrived 8 days ago, toaster's unopened",
    answer: "For the kettle, since it's defective within 14 days I'll do a refund or replacement. For the toaster, it's unopened and in window so it's returnable as a change of mind, just note you'd cover return shipping on that one. Want to proceed with both?",
    verdict: 'pass',
  },
  {
    input: "two things: the kettle I bought won't heat up at all, and the matching toaster works but I decided I don't want it. both arrived 8 days ago, toaster's unopened",
    answer: "Both qualify for free returns and refunds, no shipping cost to you, sending two labels now.",
    verdict: 'fail',
  },

  // Digital download
  {
    input: "I downloaded the ebook bundle but turns out it's not what I needed. can I get a refund",
    answer: "Digital downloads are non-refundable once downloaded, so I'm not able to refund the bundle. If a file is corrupted or won't open, though, I can help get you a working copy.",
    verdict: 'pass',
  },
  {
    input: "I downloaded the ebook bundle but turns out it's not what I needed. can I get a refund",
    answer: "No worries, refunding your download now.",
    verdict: 'fail',
  },

  // Vague, missing info -> good answer gathers info instead of guessing
  {
    input: "this thing is broken and I want my money back",
    answer: "Sorry to hear that. Can you tell me what the item is and roughly when it was delivered? That'll let me check whether it's within the 14-day window and get a refund or replacement started.",
    verdict: 'pass',
  },
  {
    input: "this thing is broken and I want my money back",
    answer: "Unfortunately that's outside our return policy, so no refund.",
    verdict: 'fail',
  },

  // Edge: exactly day 14, defective
  {
    input: "ok so the smartwatch was delivered exactly 14 days ago today and the screen just went dead. did I miss the window?",
    answer: "Day 14 is still inside the 14-day window, so you're covered. Since it's defective I can do a full refund or a replacement.",
    verdict: 'pass',
  },
  {
    input: "ok so the smartwatch was delivered exactly 14 days ago today and the screen just went dead. did I miss the window?",
    answer: "Sorry, day 14 means the window has closed, so no return.",
    verdict: 'fail',
  },
];
