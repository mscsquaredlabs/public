(function () {
  const quoteEl = document.getElementById('quote-text');
  const authorSmallEl = document.querySelector('#quote-container .author small');
  const buttonEl = document.getElementById('new-vibe-btn');

  // 100 quotes
  const samples = [
    { q: 'Vibe high, work smart, stay kind.', a: 'Unknown' },
    { q: 'Simplicity is the ultimate sophistication.', a: 'Leonardo da Vinci' },
    { q: 'What you do every day matters more than what you do once in a while.', a: 'Gretchen Rubin' },
    { q: 'Action is the foundational key to all success.', a: 'Pablo Picasso' },
    { q: 'Make it simple, but significant.', a: 'Don Draper' },
    { q: 'Well begun is half done.', a: 'Aristotle' },
    { q: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.', a: 'Antoine de Saint-Exupéry' },
    { q: 'Do the hard things first.', a: 'Unknown' },
    { q: 'The details are not the details. They make the design.', a: 'Charles Eames' },
    { q: 'Less, but better.', a: 'Dieter Rams' },
    { q: 'Focus is saying no.', a: 'Steve Jobs' },
    { q: 'The only way out is through.', a: 'Robert Frost' },
    { q: 'Small steps every day.', a: 'Unknown' },
    { q: 'Clarity is kind.', a: 'Brené Brown' },
    { q: 'Work hard in silence; let success make the noise.', a: 'Unknown' },
    { q: 'Move fast and make things.', a: 'Unknown' },
    { q: 'The best time to plant a tree was 20 years ago. The second best time is now.', a: 'Chinese Proverb' },
    { q: 'Ships are safe in harbor, but that’s not what ships are for.', a: 'John A. Shedd' },
    { q: 'Start where you are. Use what you have. Do what you can.', a: 'Arthur Ashe' },
    { q: 'If it matters, you’ll find a way.', a: 'Unknown' },
    { q: 'Your future is created by what you do today, not tomorrow.', a: 'Robert Kiyosaki' },
    { q: 'You miss 100% of the shots you don’t take.', a: 'Wayne Gretzky' },
    { q: 'If you get tired, learn to rest, not to quit.', a: 'Banksy' },
    { q: 'Discipline equals freedom.', a: 'Jocko Willink' },
    { q: 'Dream big. Start small. Act now.', a: 'Robin Sharma' },
    { q: 'Creativity is intelligence having fun.', a: 'Albert Einstein' },
    { q: 'Do one thing well.', a: 'Unknown' },
    { q: 'Motivation is what gets you started. Habit is what keeps you going.', a: 'Jim Rohn' },
    { q: 'If you can’t explain it simply, you don’t understand it well enough.', a: 'Albert Einstein' },
    { q: 'Quality is not an act, it is a habit.', a: 'Aristotle' },
    { q: 'What gets measured gets managed.', a: 'Peter Drucker' },
    { q: 'Stay hungry. Stay foolish.', a: 'Steve Jobs' },
    { q: 'Courage is grace under pressure.', a: 'Ernest Hemingway' },
    { q: 'The secret of getting ahead is getting started.', a: 'Mark Twain' },
    { q: 'Do more of what works.', a: 'Unknown' },
    { q: 'Be so good they can’t ignore you.', a: 'Steve Martin' },
    { q: 'Make it work. Make it right. Make it fast.', a: 'Kent Beck' },
    { q: 'The obstacle is the way.', a: 'Ryan Holiday' },
    { q: 'Good design is as little design as possible.', a: 'Dieter Rams' },
    { q: 'Deep focus, shallow distractions.', a: 'Unknown' },
    { q: 'Either you run the day, or the day runs you.', a: 'Jim Rohn' },
    { q: 'Do the right thing, even when no one is looking.', a: 'Unknown' },
    { q: 'Saying no is a superpower.', a: 'Unknown' },
    { q: 'Don’t let perfect be the enemy of good.', a: 'Voltaire' },
    { q: 'Energy flows where attention goes.', a: 'Tony Robbins' },
    { q: 'Everything is figureoutable.', a: 'Marie Forleo' },
    { q: 'Hard choices, easy life. Easy choices, hard life.', a: 'Jerzy Gregorek' },
    { q: 'Make progress, not excuses.', a: 'Unknown' },
    { q: 'Work on things that matter.', a: 'Unknown' },
    { q: 'Done is better than perfect.', a: 'Sheryl Sandberg' },
    { q: 'Turn pro.', a: 'Steven Pressfield' },
    { q: 'Consistency compounds.', a: 'Sahil Bloom' },
    { q: 'Less talk, more walk.', a: 'Unknown' },
    { q: 'Slow is smooth. Smooth is fast.', a: 'Navy SEALs' },
    { q: 'The main thing is to keep the main thing the main thing.', a: 'Stephen Covey' },
    { q: 'A year from now you’ll wish you started today.', a: 'Karen Lamb' },
    { q: 'Your vibe attracts your tribe.', a: 'Unknown' },
    { q: 'The man who moves a mountain begins by carrying away small stones.', a: 'Confucius' },
    { q: 'We are what we repeatedly do.', a: 'Aristotle' },
    { q: 'Think big, start small, learn fast.', a: 'Unknown' },
    { q: 'Direction is more important than speed.', a: 'Unknown' },
    { q: 'Habits are the compound interest of self-improvement.', a: 'James Clear' },
    { q: 'What you are not changing, you are choosing.', a: 'Unknown' },
    { q: 'If it’s not a clear yes, it’s a no.', a: 'Derek Sivers' },
    { q: 'The way you do anything is the way you do everything.', a: 'Unknown' },
    { q: 'Courage is a muscle. Use it.', a: 'Ruth Gordon' },
    { q: 'Make your bed.', a: 'William H. McRaven' },
    { q: 'Dreams don’t work unless you do.', a: 'John C. Maxwell' },
    { q: 'Win the morning, win the day.', a: 'Tim Ferriss' },
    { q: 'Work hard. Be kind. That is all.', a: 'Conan O’Brien' },
    { q: 'Define success on your own terms.', a: 'Harvey Mackay' },
    { q: 'Clarity precedes mastery.', a: 'Robin Sharma' },
    { q: 'Make time, not excuses.', a: 'Unknown' },
    { q: 'It always seems impossible until it’s done.', a: 'Nelson Mandela' },
    { q: 'The best way to predict the future is to create it.', a: 'Peter Drucker' },
    { q: 'If you want to go fast, go alone. If you want to go far, go together.', a: 'African Proverb' },
    { q: 'You become what you give your attention to.', a: 'Epictetus' },
    { q: 'Work smarter, then harder.', a: 'Unknown' },
    { q: 'The cost of being wrong is less than the cost of doing nothing.', a: 'Seth Godin' },
    { q: 'To live a creative life, we must lose our fear of being wrong.', a: 'Joseph Chilton Pearce' },
    { q: 'Create more than you consume.', a: 'Unknown' },
    { q: 'Do it with passion or not at all.', a: 'Unknown' },
    { q: 'If opportunity doesn’t knock, build a door.', a: 'Milton Berle' },
    { q: 'Your habits define your future.', a: 'Unknown' },
    { q: 'Strive for progress, not perfection.', a: 'Unknown' },
    { q: 'Great things are done by a series of small things brought together.', a: 'Vincent van Gogh' },
    { q: 'Success is the sum of small efforts repeated day in and day out.', a: 'Robert Collier' },
    { q: 'Make each day your masterpiece.', a: 'John Wooden' },
    { q: 'You don’t have to be extreme, just consistent.', a: 'Unknown' },
    { q: 'Live less out of habit and more out of intent.', a: 'Unknown' },
    { q: 'The only limit to our realization of tomorrow is our doubts of today.', a: 'Franklin D. Roosevelt' },
    { q: 'Action cures fear.', a: 'David J. Schwartz' },
    { q: 'Systems over goals.', a: 'James Clear' },
    { q: 'Stay the course.', a: 'Unknown' },
    { q: 'If you’re going through hell, keep going.', a: 'Winston Churchill' },
    { q: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', a: 'Winston Churchill' },
    { q: 'Everything you want is on the other side of consistency.', a: 'Unknown' },
    { q: 'Be a voice, not an echo.', a: 'Albert Einstein' },
    { q: 'Think clearly. Build simply. Ship quickly.', a: 'Unknown' },
    { q: 'Elegance is refused.', a: 'Coco Chanel' },
    { q: 'He who is not courageous enough to take risks will accomplish nothing in life.', a: 'Muhammad Ali' },
    { q: 'Never confuse motion with progress.', a: 'Benjamin Franklin' },
    { q: 'Keep it simple.', a: 'Unknown' },
    { q: 'Read, write, execute.', a: 'Unknown' },
    { q: 'The secret is to show up.', a: 'Unknown' },
    { q: 'Design is thinking made visual.', a: 'Saul Bass' },
    { q: 'You are what you repeatedly create.', a: 'Unknown' },
    { q: 'Don’t count the days, make the days count.', a: 'Muhammad Ali' },
    { q: 'The man who has confidence in himself gains the confidence of others.', a: 'Hasidic Proverb' },
    { q: 'Make something people want.', a: 'Paul Graham' },
    { q: 'Execution is everything.', a: 'Unknown' },
    { q: 'The more I practice, the luckier I get.', a: 'Gary Player' },
    { q: 'Keep going. No feeling is final.', a: 'Rainer Maria Rilke' }
  ];

  let lastIndex = -1;
  function pickRandomIndex() {
    if (samples.length <= 1) return 0;
    let idx = Math.floor(Math.random() * samples.length);
    // avoid immediate repeat
    if (idx === lastIndex) {
      idx = (idx + 1) % samples.length;
    }
    lastIndex = idx;
    return idx;
  }

  function setRandomQuote() {
    const pick = samples[pickRandomIndex()];
    quoteEl.textContent = pick.q;
    authorSmallEl.textContent = `— ${pick.a}`;
  }

  buttonEl.addEventListener('click', setRandomQuote);

  // Initial vibe
  setRandomQuote();

  // Auto-update every 10 seconds
  setInterval(setRandomQuote, 10000);
})();

