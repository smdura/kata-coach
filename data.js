/* Kata Coach content: Wado-ryu.
   Everything the app knows about kata, grades and terminology lives here.
   Edit this file to match your club's syllabus.

   Directions are compass points relative to the starting position:
   N = the front you face at yoi, E = your right, S = behind you, W = your left.

   Steps can also be entered or corrected inside the app ("Edit steps"),
   which saves them on that phone only. */

(function () {
  const ST = {
    JD: { j: 'junzuki-dachi', e: 'forward stance' },
    JDS: { j: 'junzuki-dachi (short)', e: 'forward stance, shortened' },
    NA: { j: 'neko-ashi-dachi', e: 'cat stance' },
  };
  const TE = {
    GB: { j: 'Gedan-barai', e: 'downward block' },
    JZ: { j: 'Junzuki chudan', e: 'stepping punch, middle level' },
    JU: { j: 'Jodan-uke', e: 'rising block' },
    TU: { j: 'Tettsui-uchi', e: 'hammer-fist strike' },
    SU: { j: 'Shuto-uke', e: 'knife-hand block' },
  };
  const SIDE = { L: ['Hidari', 'Left'], R: ['Migi', 'Right'] };

  // m(direction, side, stance, technique, note, kiai)
  function m(d, side, st, te, n, k) {
    const s = ST[st], t = TE[te], [jp, en] = SIDE[side];
    return {
      d,
      s: `${jp} ${s.j}`,
      se: `${en} ${s.e}`,
      t: t.j,
      te: `${en} ${t.e}`,
      n: n || '',
      k: !!k,
    };
  }

  // Pinan Nidan: the first kata in most Wado-ryu syllabuses.
  // Wado associations differ in details. Check against your instructor.
  const pinanNidan = [
    m('W', 'L', 'JD', 'GB', 'Turn 90° to the left, stepping out with the left foot.'),
    m('W', 'R', 'JD', 'JZ', 'Step forward. Drive from the hips.'),
    m('E', 'R', 'JD', 'GB', 'Turn 180° to the right, moving the right foot.'),
    m('E', 'R', 'JDS', 'TU', 'Draw the right foot in as the right fist circles up, then strike as you settle.'),
    m('E', 'L', 'JD', 'JZ', 'Step forward.'),
    m('N', 'L', 'JD', 'GB', 'Turn 90° to the left to face the front.'),
    m('N', 'R', 'JD', 'JU', 'Step forward.'),
    m('N', 'L', 'JD', 'JU', 'Step forward.'),
    m('N', 'R', 'JD', 'JU', 'Step forward.', true),
    m('E', 'L', 'JD', 'GB', 'Turn 270° to the left, moving the left foot.'),
    m('E', 'R', 'JD', 'JZ', 'Step forward.'),
    m('W', 'R', 'JD', 'GB', 'Turn 180° to the right, moving the right foot.'),
    m('W', 'L', 'JD', 'JZ', 'Step forward.'),
    m('S', 'L', 'JD', 'GB', 'Turn 90° to the left to face the back.'),
    m('S', 'R', 'JD', 'JZ', 'Step forward.'),
    m('S', 'L', 'JD', 'JZ', 'Step forward.'),
    m('S', 'R', 'JD', 'JZ', 'Step forward.', true),
    m('W', 'L', 'NA', 'SU', 'Turn 270° to the left, moving the left foot.'),
    m('NW', 'R', 'NA', 'SU', 'Step 45° forward to the right.'),
    m('E', 'R', 'NA', 'SU', 'Turn 135° to the right, moving the right foot.'),
    m('NE', 'L', 'NA', 'SU', 'Step 45° forward to the left.'),
  ];

  window.KATA_DATA = {
    style: 'Wado-ryu',
    note: 'Example syllabus based on a common Wado-ryu grading order. Belt colours, kata order and details differ between associations, so check with your instructor.',

    // Grades in order, lowest first. `kata` = required, `choice` = pick one to present.
    grades: [
      { id: '9', name: '9th Kyu', belt: '#d4352b', kata: ['pinan-nidan'] },
      { id: '8', name: '8th Kyu', belt: '#f2c81d', kata: ['pinan-shodan'] },
      { id: '7', name: '7th Kyu', belt: '#ef8a1f', kata: ['pinan-sandan'] },
      { id: '6', name: '6th Kyu', belt: '#2f9a4c', kata: ['pinan-yondan'] },
      { id: '5', name: '5th Kyu', belt: '#2a63c4', kata: ['pinan-godan'] },
      { id: '4', name: '4th Kyu', belt: '#7a3fa8', kata: ['kushanku'] },
      { id: '3', name: '3rd Kyu', belt: '#7b4a2a', kata: ['naihanchi'] },
      { id: '2', name: '2nd Kyu', belt: '#7b4a2a', stripes: 1, kata: ['seishan'] },
      { id: '1', name: '1st Kyu', belt: '#7b4a2a', stripes: 2, kata: ['chinto'] },
      { id: 'd1', name: 'Shodan', belt: '#15161c', choice: ['kushanku', 'naihanchi', 'seishan', 'chinto'] },
      { id: 'd2', name: 'Nidan and above', belt: '#15161c', stripes: 0, choice: ['bassai', 'niseishi', 'rohai', 'wanshu', 'jion', 'jitte'] },
    ],

    kata: [
      {
        id: 'pinan-nidan', name: 'Pinan Nidan', kanji: '平安二段', meaning: 'Peaceful mind, level two',
        embusen: 'I-shape', draft: true,
        points: [
          'The first Pinan taught in Wado-ryu. It is close to Shotokan\'s Heian Shodan.',
          'Wado stances are shorter and higher than Shotokan\'s. Stay light and mobile.',
          'The closing shuto-uke are done in neko-ashi-dachi.',
          'Drive junzuki from the hips so the whole body arrives at once.',
        ],
        steps: pinanNidan,
      },
      {
        id: 'pinan-shodan', name: 'Pinan Shodan', kanji: '平安初段', meaning: 'Peaceful mind, level one',
        embusen: 'I-shape',
        points: [
          'Usually taught second in Wado, despite the name.',
          'Close in outline to Shotokan\'s Heian Nidan. Watch for Wado-specific stances and hand positions.',
          'Keep the side kick and back-fist together on the same side.',
        ],
        steps: null,
      },
      {
        id: 'pinan-sandan', name: 'Pinan Sandan', kanji: '平安三段', meaning: 'Peaceful mind, level three',
        embusen: 'T-shape',
        points: [
          'Double blocks: the arms cross close to the body before snapping out.',
          'Contains a section in a straddle stance with elbow techniques.',
          'Keep the torso upright and the hips settled.',
        ],
        steps: null,
      },
      {
        id: 'pinan-yondan', name: 'Pinan Yondan', kanji: '平安四段', meaning: 'Peaceful mind, level four',
        embusen: 'I-shape',
        points: [
          'The opening open-hand blocks are slow and controlled.',
          'Knee strike while both hands pull down.',
          'Make the contrast between slow and fast moves clear.',
        ],
        steps: null,
      },
      {
        id: 'pinan-godan', name: 'Pinan Godan', kanji: '平安五段', meaning: 'Peaceful mind, level five',
        embusen: 'I-shape',
        points: [
          'Juji-uke (X-block), low and then high.',
          'The jump: land low and balanced, ready to move.',
          'The last of the Pinan. Examiners often ask for any of the five.',
        ],
        steps: null,
      },
      {
        id: 'kushanku', name: 'Kushanku', kanji: 'クーシャンクー', meaning: 'Named after a Chinese envoy to Okinawa',
        embusen: 'I-shape',
        points: [
          'A long kata. It opens with the hands rising to frame the sky.',
          'Includes a drop to the floor and back up.',
          'Varied rhythm: slow, deliberate moves mixed with explosive ones.',
        ],
        steps: null,
      },
      {
        id: 'naihanchi', name: 'Naihanchi', kanji: 'ナイハンチ', meaning: 'Side-to-side fighting',
        embusen: 'Straight line',
        points: [
          'Performed sideways along a single line in naihanchi-dachi.',
          'Turn the head sharply before each change of direction.',
          'Short, close-range techniques. Power comes from the hips, not the arms.',
        ],
        steps: null,
      },
      {
        id: 'seishan', name: 'Seishan', kanji: 'セイシャン', meaning: 'Thirteen',
        embusen: 'Straight line',
        points: [
          'Strong, steady movements in seishan-dachi.',
          'Breathing and tension are part of the kata. Don\'t rush it.',
        ],
        steps: null,
      },
      {
        id: 'chinto', name: 'Chinto', kanji: 'チントウ', meaning: 'Fighting to the east',
        embusen: 'Diagonal',
        points: [
          'One-legged positions test your balance.',
          'Crane-like techniques. Hold each finishing position cleanly.',
        ],
        steps: null,
      },
      {
        id: 'bassai', name: 'Bassai', kanji: '抜塞', meaning: 'To storm a fortress',
        embusen: 'I-shape',
        points: ['Opens with a forward surge and a reinforced block.', 'Hip rotation drives every block switch.'],
        steps: null,
      },
      {
        id: 'niseishi', name: 'Niseishi', kanji: '二十四歩', meaning: 'Twenty-four steps',
        embusen: 'I-shape',
        points: ['Flowing, connected movements.', 'Shown at dan grades.'],
        steps: null,
      },
      {
        id: 'rohai', name: 'Rohai', kanji: 'ローハイ', meaning: 'Vision of a white heron',
        embusen: 'I-shape',
        points: ['Includes a one-legged heron stance.', 'Shown at dan grades.'],
        steps: null,
      },
      {
        id: 'wanshu', name: 'Wanshu', kanji: 'ワンシュー', meaning: 'Named after a Chinese envoy',
        embusen: 'I-shape',
        points: ['Includes a jumping technique.', 'Shown at dan grades.'],
        steps: null,
      },
      {
        id: 'jion', name: 'Jion', kanji: '慈恩', meaning: 'Named after the Jion-ji temple',
        embusen: 'I-shape',
        points: ['Calm, rooted and powerful.', 'Shown at dan grades.'],
        steps: null,
      },
      {
        id: 'jitte', name: 'Jitte', kanji: '十手', meaning: 'Ten hands',
        embusen: 'I-shape',
        points: ['Techniques against an armed opponent.', 'Shown at dan grades.'],
        steps: null,
      },
    ],

    glossary: [
      ['Wado-ryu', [
        ['Wado', '"Way of harmony." Founded by Hironori Ohtsuka.'],
        ['Tai sabaki', 'Body movement to move off the line of attack.'],
        ['Nagasu', 'To flow or deflect an attack.'],
        ['Inasu', 'To evade or slip an attack.'],
        ['Noru', 'To ride an attack and take over its momentum.'],
        ['Kihon kumite', 'Wado\'s set pair-work sequences, often graded alongside kata.'],
        ['Ohyo kumite', 'Applied pair-work sequences.'],
      ]],
      ['Basics', [
        ['Rei', 'Bow'],
        ['Yoi', 'Ready. The position before the first move.'],
        ['Yame', 'Stop. Return to the ready position.'],
        ['Kiai', 'Spirit shout on a decisive technique.'],
        ['Embusen', 'The floor pattern a kata follows.'],
        ['Zanshin', 'Staying alert after the technique or kata finishes.'],
        ['Hikite', 'The pulling hand that returns to the hip.'],
        ['Bunkai', 'Applications of the moves in a kata.'],
        ['Tokui kata', 'Your chosen kata for a grading.'],
        ['Hidari / Migi', 'Left / right'],
        ['Jodan / Chudan / Gedan', 'Head level / middle level / low level'],
      ]],
      ['Stances (dachi)', [
        ['Junzuki-dachi', 'Forward stance used for junzuki. Shorter and higher than Shotokan\'s zenkutsu-dachi.'],
        ['Gyakuzuki-dachi', 'Forward stance used for gyakuzuki, slightly longer, hips turned in.'],
        ['Neko-ashi-dachi', 'Cat stance. Front foot on the ball, almost no weight on it.'],
        ['Shiko-dachi', 'Straddle stance, toes turned out, hips low.'],
        ['Naihanchi-dachi', 'Side straddle stance used in Naihanchi.'],
        ['Seishan-dachi', 'Short, strong stance used in Seishan.'],
      ]],
      ['Blocks (uke)', [
        ['Gedan-barai', 'Downward sweeping block.'],
        ['Jodan-uke', 'Rising block to protect the head.'],
        ['Soto-uke', 'Outside-to-inside forearm block.'],
        ['Uchi-uke', 'Inside-to-outside forearm block.'],
        ['Shuto-uke', 'Knife-hand block.'],
        ['Juji-uke', 'X-block.'],
      ]],
      ['Strikes and kicks', [
        ['Junzuki', 'Stepping punch, same side as the front leg.'],
        ['Gyakuzuki', 'Reverse punch, opposite side to the front leg.'],
        ['Junzuki-no-tsukkomi', 'Junzuki with the body leaning in.'],
        ['Gyakuzuki-no-tsukkomi', 'Gyakuzuki with the body leaning in.'],
        ['Tettsui-uchi', 'Hammer-fist strike.'],
        ['Uraken-uchi', 'Back-fist strike.'],
        ['Empi-uchi', 'Elbow strike.'],
        ['Nukite', 'Spear-hand thrust.'],
        ['Mae-geri', 'Front kick.'],
        ['Yoko-geri', 'Side kick.'],
      ]],
      ['Counting', [
        ['Ichi, ni, san', '1, 2, 3'],
        ['Shi, go, roku', '4, 5, 6'],
        ['Shichi, hachi, ku', '7, 8, 9'],
        ['Ju', '10'],
        ['Ju-ichi', '11. Tens and units combine: ni-ju-ichi is 21.'],
      ]],
    ],
  };
})();
