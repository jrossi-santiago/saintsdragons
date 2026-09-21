/* Saints & Dragons — nightly content.
 *
 * Seed content. Every card, brief, tale and date entry below is real history,
 * written to the voice rules, and is meant to be edited or replaced as the
 * real schedule fills in. The shapes are what app.js renders against:
 *
 *   CARDS   one per night, newest last. Points at a brief and a tale.
 *   BRIEFS  the four-minute read for the dad. Keyed by slug.
 *   TALES   the read-aloud. Keyed by slug.
 *   TODAY   one entry per calendar date, keyed "MM-DD".
 *
 * No saints, no explicit religious language anywhere except the "Before lights
 * out" prayer or verse and the one-line "Why this is ours".
 */

const ERAS = ["Greece and Rome", "Knights and lords", "The 1700s", "The 1800s", "1900 to 1950", "And everything else"];
const KINDS = ["A person", "A battle", "A council", "A builder", "A mother", "A heresy", "A feast"];
const THEMES = ["Knights", "Dragons", "Forests", "Courage", "Obedience", "Mercy"];

/* ---------------------------------------------------------------- briefs */

const BRIEFS = {
  "lepanto": {
    title: "The Day the Sea Went Quiet",
    era: "And everything else",
    kind: "A battle",
    minutes: 4,
    hook: "Four hours of the loudest fighting in the world, decided by men chained to benches.",
    stillWithUs: "The word for a ship's lowest, hardest work is still galley, and so is the word for a ship's kitchen.",
    tale: "boy-who-counted-oars",
    body: [
      "On the morning of 7 October 1571, two fleets found each other in the Gulf of Patras, off the west coast of Greece. Between them they had about four hundred ships and something close to a hundred and forty thousand men. Almost none of those men had chosen to be there.",
      "That is the part nobody tells you. A war galley in 1571 was not a sailing ship. It was a rowing machine a hundred and fifty feet long, and the engine was men. Three or four to an oar, twenty-five or thirty oars a side. On the Ottoman ships and on the Christian ones alike, most of those rowers were slaves or convicts, and most of them were chained to the bench by the ankle. They could not see out. They rowed to a drum.",
      "The commander on the Christian side was Don John of Austria, twenty-four years old, illegitimate son of an emperor, given the job partly because nobody else could be given it without one of the allied cities walking away. Venice, Spain and Genoa hated each other roughly as much as they feared the fleet coming the other way. Don John's first real act of command was not tactical. He had the chains struck off the Christian galley slaves and promised them their freedom, and he went from ship to ship in a fast boat so the men could see his face.",
      "His second act was stranger. He had the rams sawn off the front of his own galleys. The ram was the ancient weapon, the thing that made a galley a galley, and it also pointed the guns in the bow uselessly at the sky. Cut it off and the bow guns could fire flat, into the waterline of whatever was coming. He also put six huge Venetian galleasses out in front of his line, floating gun platforms too fat to row properly, and simply towed them into place.",
      "The Ottoman fleet under Ali Pasha came on in a crescent, which is what a faster fleet does to a slower one. It rowed straight into the galleasses and lost perhaps seventy ships before the two lines ever touched. Then the lines touched, and for four hours the battle was not a naval battle at all. Ships grappled and the fighting went hand to hand across the decks, as if the sea had been paved over.",
      "It ended in the early afternoon. The Ottoman flagship was boarded, Ali Pasha was killed, and the banner came down. About a hundred and twenty Ottoman galleys were captured whole. Some twelve thousand Christian galley slaves came off the benches alive and free, which is the number that mattered most to the men who had been rowing that morning.",
      "Strategically it changed less than the celebrations claimed. The Ottoman navy was rebuilt within a year. What it changed was the idea that it could not be done. For a generation the assumption had been that the fleet coming west was simply going to keep coming west.",
      "One more detail. Aboard the Marquesa, in the thick of it, was a twenty-four-year-old Spanish soldier with a fever. He was told to stay below. He refused, went up, took three gunshot wounds, and lost the use of his left hand for the rest of his life. His name was Miguel de Cervantes, and thirty-four years later he wrote Don Quixote. He called Lepanto the greatest occasion the past or present has seen, and he never stopped being proud of the hand."
    ]
  },

  "vienna": {
    title: "The Morning the Hill Moved",
    era: "And everything else",
    kind: "A battle",
    minutes: 4,
    hook: "Twenty thousand horsemen came down a mountain into the side of an army that had been digging for two months.",
    stillWithUs: "The croissant is supposed to come from this siege. The story is almost certainly false and everyone tells it anyway.",
    tale: "riders-with-wings",
    body: [
      "Vienna in July 1683 had about fifteen thousand defenders and walls that were good but not new. Outside was an army of perhaps a hundred and fifty thousand under the Grand Vizier Kara Mustafa. He did not try to storm the walls. He did something slower and much worse.",
      "He dug. Ottoman siege engineering was the best in the world, and what it did was drive tunnels under the city's defences, pack the ends with gunpowder, and bring the walls down from underneath. For two months the trenches crept forward. The defenders dug their own tunnels to meet them, and men fought each other underground in the dark with knives and shovels. By early September the outer defences had holes in them and the garrison was down to about four thousand men who could still stand.",
      "They had sent for help in July. Help is a slow word. A relief force had to be assembled out of the Holy Roman Empire's various princes and out of Poland, and it had to be assembled under someone all of them would actually obey. That turned out to be John III Sobieski, King of Poland, who arrived with the one thing nobody else had.",
      "The Polish winged hussars were heavy cavalry, and they are not quite like anything else in military history. A hussar carried a lance nineteen feet long, longer than a pike, hollowed out to keep the weight down. It shattered on impact by design, and behind it the man had a sabre, a war hammer and two pistols. On his back, or on the saddle, was a wooden frame of eagle feathers. Nobody agrees on what the wings were for. The romantic answer is the noise. The practical answer is that they made the horse and rider look enormous and were hard to lasso.",
      "On 11 September the relief army finished coming over the Vienna Woods, which is steep, forested ground that no one expected an army with artillery to cross. They came down it anyway, dragging guns by rope. Kara Mustafa had his army facing the city and had to turn it around.",
      "The fighting took most of 12 September, infantry grinding down the slope through vineyards. In the late afternoon Sobieski formed up about twenty thousand cavalry on the high ground, three thousand of them hussars, and sent them down into the Ottoman flank. It is still the largest cavalry charge ever made. The Ottoman line did not break in the usual sense. It came apart. Within three hours Sobieski was standing in Kara Mustafa's abandoned tent.",
      "The Grand Vizier got back to Belgrade, where the Sultan had him strangled with a silk cord, which was the traditional courtesy for a defeated commander of high rank. The empire that had been pushing west for three hundred years began, from that autumn, to push the other way.",
      "Sobieski wrote to his wife the next day. He was fifty-four, he had been riding for weeks, and the letter is mostly about the tent, the horses, and a parrot that got away in the confusion."
    ]
  },

  "tours": {
    title: "The Hammer",
    era: "Knights and lords",
    kind: "A battle",
    minutes: 4,
    hook: "A general spent seven days refusing to fight, and won because of it.",
    stillWithUs: "Charles's nickname went to his grandson's family name and then to a hundred thousand boys. Charlemagne is just Charles the Great.",
    tale: "wall-that-would-not-move",
    body: [
      "In October 732, somewhere between Tours and Poitiers in what is now central France, a Frankish army stood on a wooded hill for seven days and refused to come down.",
      "The man who put them there was Charles, mayor of the palace. That title needs explaining. The Frankish kings of that generation did almost nothing. They were carried about in ox carts and produced heirs, and the actual government was run by an official whose job had started out as household steward. Charles was that official. He was also, by 732, the most experienced soldier in western Europe, and he had spent years building something nobody else in the West had: a standing army of full-time professional infantry.",
      "That took money he did not have, so he took it. He confiscated church lands to pay and equip his men, which made him permanently unpopular with the people who wrote the chronicles. It is worth knowing that the man remembered as the defender of Christian Europe funded his army by seizing Christian property, and that the chroniclers who praised him for the first never quite forgave him for the second.",
      "Coming north was an Umayyad force under Abd al-Rahman al-Ghafiqi, the governor of al-Andalus. It was primarily cavalry, and it was very good. Its method for a century had been simple and nearly undefeated: ride at the enemy line, and the enemy line, which was usually a levy of farmers, would break. Then ride them down from behind. Almost all casualties in ancient and medieval battle happen after one side turns and runs.",
      "Charles understood the method and built his week around denying it. He got between the raiders and Tours by marching on back roads, so his position was a surprise. He chose high wooded ground, where cavalry has to come uphill through trees. He formed his infantry into a dense square and told them to stand. Then he waited seven days while the weather got colder, because his men had cloaks and the Umayyad cavalry, raiding from the south in autumn, did not.",
      "Abd al-Rahman eventually had to attack. The chronicler's line is that the Franks stood there like a wall, like a belt of ice frozen together, and it is the only sentence most people ever read about the battle. The cavalry came up the hill and hit the square and did not break it. That had not happened before.",
      "The battle turned on a rumour. Scouts Charles had sent around the flank got into the Umayyad camp and started freeing prisoners and looting. Word ran through the cavalry that the camp was being taken, and a good part of it disengaged to ride back and save the plunder. Abd al-Rahman tried to stop them, was surrounded, and was killed. By morning the camp was empty. The Franks, expecting a trap, scouted all day before believing it.",
      "Charles was called Martel afterwards, the Hammer. Whether the battle saved Europe is argued about endlessly, and the honest answer is that it was one of several. What is not arguable is the domestic result. Charles ended the day as the unquestioned power in Francia. His son Pépin took the crown outright. His grandson was Charlemagne."
    ]
  },

  "dome": {
    title: "The Man Who Would Not Say How",
    era: "Knights and lords",
    kind: "A builder",
    minutes: 4,
    hook: "Florence built a cathedral with a hole in the roof and no idea how to close it, and left the hole there for fifty years.",
    stillWithUs: "Four million bricks, six hundred years, no steel. It is still the largest masonry dome on earth.",
    tale: "egg-and-the-dome",
    body: [
      "In 1367 the city of Florence approved a design for its cathedral that included a dome a hundred and forty-three feet across. Nobody in Europe knew how to build a dome a hundred and forty-three feet across. The city approved it anyway, and it is worth sitting with that for a second. They committed, in writing, to a building they could not finish, on the assumption that somebody would work it out before they got to the top.",
      "Then they built the rest of the cathedral and got to the top. By 1418 there was a church in the middle of Florence with an octagonal hole in the roof a hundred and forty feet up, open to the weather, and had been for years.",
      "The problem is not the dome. The problem is the day before the dome. A masonry arch does not stand until the last stone is in, so every arch and vault in Europe was built on centering, a full wooden skeleton holding the stone in place until the mortar cured. To centre a dome of this size you would need a forest, and a scaffold rising from the cathedral floor a hundred and forty feet below. Tuscany did not have the timber. Anyone who costed it honestly came back with a number the city would not pay.",
      "The city held a competition in 1418. Among the entries was one from Filippo Brunelleschi, a goldsmith by training, difficult, secretive, a man who had lost a competition for the baptistery doors twenty years earlier and had then gone to Rome and spent years crawling over the ruins measuring things. He said he could build it without centering. He declined to say how. He argued that if he explained the method he would simply be thanked and dismissed.",
      "This is where the egg belongs. The story, told first by Vasari a century later and therefore probably improved, is that the judges pressed him and he proposed instead that whoever could stand an egg upright on a flat slab of marble should get the commission. Everyone tried. Brunelleschi took the egg, cracked its base on the marble, and stood it up. The others said they could have done that. He said yes, and you would say the same about the dome if I told you how.",
      "He got the job, jointly with his old rival Ghiberti, which he resented for the rest of his life. His actual solution was several solutions at once. Two domes, an inner shell and an outer, braced together, so the load came down in ribs rather than in one dead weight. Herringbone brickwork, where bricks set vertically at intervals lock each course and keep the courses above from sliding inward before the mortar sets. Rings of sandstone and iron cramps around the base, holding the whole thing in like a barrel hoop. And an ox-driven hoist with a reversible gear, so a team of oxen could raise and lower load without being unhitched and turned around.",
      "It took sixteen years. He kept wine and food up on the platforms so the masons would not spend half a day climbing down and back for lunch. He watered the wine. Four million bricks went up, and the dome was closed in 1436.",
      "He is buried underneath it. For centuries nobody knew exactly where, and the grave was found by accident during excavations in 1972."
    ]
  },

  "athelney": {
    title: "The King in the Marsh",
    era: "Knights and lords",
    kind: "A person",
    minutes: 4,
    hook: "In January a king had a kingdom. By February he had a swamp, a handful of men, and a burned loaf of bread.",
    stillWithUs: "He had the law and the histories put into English because he thought a country that cannot read its own language will eventually stop being one.",
    tale: "king-who-burnt-the-bread",
    body: [
      "The Great Heathen Army landed in England in 865, and over the following decade it ended three of the four English kingdoms. Northumbria, East Anglia and Mercia were gone. By the winter of 877 only Wessex was left, and Wessex had a young king named Alfred who had been buying time with money for years.",
      "In early January 878 the Danish leader Guthrum broke the truce and attacked Chippenham during the twelve days of Christmas, when nobody campaigned and the king's household was dispersed and, in the season's fashion, drunk. It worked completely. Alfred escaped into the Somerset Levels with what one chronicle calls a small company, which is a polite way of saying he was a fugitive.",
      "The Levels in winter were not farmland. They were a flooded marsh of reeds and alder, crossed by paths you had to know, with occasional islands of dry ground. He spent roughly three months on one of them, at Athelney, raiding for supplies. That is the entire low point of English history compressed into one man in a swamp.",
      "The cakes belong here. A century later a monk wrote that Alfred sheltered in a swineherd's cottage where the wife, not knowing who he was, set him to watch loaves baking on the hearth and came back to find them burnt and the king staring at nothing, and gave him the rough side of her tongue. It is almost certainly a later invention. It has survived a thousand years because it is the only story anyone tells about a king that begins with him being told off for ruining the dinner.",
      "In May he came out. He sent word through the shire levies, which is a system of men who farm and are called up, and had them meet him at Egbert's Stone. Asser says the men of Somerset, Wiltshire and Hampshire came and rejoiced to see him, because they had believed he was dead. Two days later he fought Guthrum at Edington and broke him, then followed the survivors to Chippenham and sat outside for fourteen days until they gave in.",
      "What he did next is the reason he is the only English king called the Great. He did not execute Guthrum. He stood godfather at his baptism, kept him at court for twelve days, loaded him with gifts and sent him home to rule East Anglia under a treaty with a drawn border. It was not softness. Alfred had worked out that a Danish king inside the settlement structure was cheaper and steadier than a dead Danish king and a new one every spring.",
      "Then he spent twenty years on infrastructure. A ring of fortified towns, the burhs, laid out so no part of Wessex was more than a long day's walk from a wall. The army split in half so one half was always in the fields and the food supply never collapsed mid campaign. Ships built longer than the Danish ones. A law code assembled out of the older English codes.",
      "And he learned Latin in his thirties and translated books himself, in the evenings, because he had decided that the works most necessary for men to know should exist in English. He wrote that he could not think of a single man south of the Thames, when he came to the throne, who could translate a letter. He was ill for most of his adult life with something that caused him serious pain, and he did the translating anyway."
    ]
  },

  "cincinnatus": {
    title: "The Plough He Went Back To",
    era: "Greece and Rome",
    kind: "A person",
    minutes: 4,
    hook: "Rome handed one man absolute power, he used it for sixteen days, and then he gave it back.",
    stillWithUs: "Cincinnati is named after him, by army officers who thought Washington had done the same thing.",
    tale: "farmer-who-was-king-for-sixteen-days",
    body: [
      "The Roman Republic was built by men who were frightened of kings. They had thrown one out and the whole constitution afterwards was an argument about making sure no one could become another. Power was split between two consuls, each of whom could veto the other, and they held office for one year only.",
      "This is an excellent system for preventing tyranny and a terrible one for an emergency. So the Romans wrote themselves a trapdoor. In a crisis the Senate could name a dictator: one man, no colleague, no veto, total authority over the state and the army. The office had a hard limit of six months and expired automatically. It was designed to be used and then to disappear.",
      "In 458 BC they used it. A Roman consular army had got itself trapped in a valley by the Aequi, surrounded and cut off, and five horsemen had ridden through the enemy line to bring the news. The Senate sent a delegation across the Tiber to a small farm, about four acres, worked by a former consul named Lucius Quinctius Cincinnatus.",
      "Livy says they found him digging, or ploughing, and that he asked whether everything was all right, and then called to his wife Racilia to fetch his toga from the hut so he could hear the Senate's message decently dressed. Then they told him he was dictator of Rome.",
      "He went into the city, called up every man of military age, ordered each of them to bring cooked rations for five days and twelve stakes, and marched that night. He reached the valley in darkness, put his men in a ring around the outside of the enemy, and had them dig. The Aequi, who had surrounded a Roman army, woke up surrounded themselves by a ditch and a palisade built overnight. They surrendered before the day was out.",
      "He made the defeated pass under a yoke, which was three spears making a low doorway you had to stoop to walk through. It was designed to be humiliating and not to be fatal. He took no land and killed nobody.",
      "Then he went back to Rome, held a triumph, resigned the dictatorship, and returned to the farm. The whole thing took fifteen or sixteen days. He had five and a half months of absolute power left and no interest in them.",
      "Whether the details are true is a fair question. Livy was writing four hundred years later, at the exact moment the Republic was being replaced by an emperor, and the story is too neat. But that is nearly the point. The Romans were telling themselves this story precisely when they were losing the thing it described, the way a family tells stories about a grandfather they are failing to live up to.",
      "In 1783, having won a war, George Washington resigned his commission and went home to farm. The officers who had served under him formed a society and named it after Cincinnatus. A few years later some of them founded a city in Ohio and named it the same. George III is supposed to have said that if Washington gave up power he would be the greatest man in the world. The bar is that low, and it was set two and a half thousand years ago by a man who wanted to get back to his field."
    ]
  }
};

/* ----------------------------------------------------------------- tales */

const TALES = {
  "boy-who-counted-oars": {
    title: "The Boy Who Counted Oars",
    age: 3,
    minutes: "10",
    theme: "Courage",
    origin: "New tale",
    brief: "lepanto",
    body: [
      "There was once a boy named Tomas who was small for his age and good at counting.",
      "He lived by the sea, in a town where the fishing boats came in at dusk, and he had a trick he did every evening. He would stand on the wall at the end of the harbour and count the oars of every boat that came home. Six oars. Four oars. Eight oars on the wide one that belonged to the man with the beard.",
      "His mother said it was a silly way to spend an evening. His father said nothing, because his father was at sea.",
      "One evening a boat came in that Tomas did not know, low in the water and rowed badly, and when it bumped against the wall the men who climbed out had irons still locked around their ankles with the chain cut short.",
      "They sat down on the stones and did not speak for a long while. Then the oldest of them looked up and saw the boy.",
      "\"You were counting,\" he said.",
      "\"I count all of them,\" said Tomas.",
      "\"Count us, then.\"",
      "Tomas counted. There were nine.",
      "\"There were two hundred,\" said the old man.",
      "And because Tomas said nothing at all, which is sometimes the wisest thing a boy can do, the old man told him the story.",
      "They had been rowers, he said, on a great ship with a hundred and fifty oars, and they had been chained to their benches for so long that they had forgotten the colour of the sky. They rowed to a drum. When the drum went fast they went fast. When it went slow they went slow. They never knew where they were going, because there is no window on a rowing bench, and they never knew why.",
      "\"Then one morning,\" said the old man, \"the drum stopped.\"",
      "A man came down among the benches with a hammer. He was young, younger than most of the rowers, and he was dressed better than anyone they had ever seen, and he knelt down in the filth of the bilge and struck the pin out of the first man's ankle iron himself.",
      "\"Why?\" said Tomas.",
      "\"That is what we asked him,\" said the old man. \"We said, why would you do that? We might run. We might row badly on purpose. We might jump over the side at the first chance.\"",
      "\"What did he say?\"",
      "\"He said: today I need men who are rowing because they have decided to.\"",
      "The old man held out his wrists, which had no irons on them at all.",
      "\"So we decided to,\" he said.",
      "Tomas thought about that for a while, the way you think about something too big to swallow whole.",
      "\"Was it hard?\" he asked.",
      "\"It was the hardest thing any of us ever did,\" said the old man. \"It was much harder than being chained. When you are chained you row because you must, and it is terrible, but it is not yours. When the chain is off, every single pull is yours. Nobody makes you. You have to make you.\"",
      "\"And did you?\"",
      "\"Every one of us,\" said the old man. \"Four hours. Not one man stopped.\"",
      "Tomas walked home in the dark, past the boats with their four oars and their six oars and their eight, and he thought about how easy it would be to stop rowing if nobody was making you.",
      "And ever after, when he counted, he counted a little differently. He was not counting oars any more. He was counting the men who had picked them up.",
      "The end."
    ]
  },

  "riders-with-wings": {
    title: "The Riders With Wings",
    age: 3,
    minutes: "11",
    theme: "Knights",
    origin: "New tale",
    brief: "vienna",
    body: [
      "In a city with a wall around it there lived a girl called Mila, and above her house there was a bell.",
      "The bell had one job. If help was ever coming, the bell would ring. That was all. Nobody had ever heard it ring, not her mother, not her grandmother, and Mila was fairly sure it did not work.",
      "Then the digging started.",
      "You could not see the diggers. That was the worst part. They were outside the wall and then, slowly, they were under it, and at night if you lay on the floor with your ear pressed to the stone you could hear them, tock, tock, tock, coming closer under the ground.",
      "Mila lay on the floor every night and listened.",
      "\"Stop that,\" said her mother.",
      "\"Somebody has to know where they are,\" said Mila.",
      "Every day the tock was a little louder, and every day the grown-ups said the word soon. Help was coming soon. Help would be here soon. Soon, soon, soon, until soon began to sound like a word people say when they have nothing else left to say.",
      "One night Mila climbed up to the bell instead, and sat with her back against the cold curve of it, and looked out at the hills.",
      "The hills were black. They were always black at night. She looked at them anyway, because looking was the only job she could think of that she was big enough to do.",
      "And then, very slowly, the hill began to move.",
      "It was not the hill. It was lights, thousands of small lights coming down through the trees on the mountain that everyone had said no army could ever cross, and they came down all night, and by grey morning the whole slope was covered in men and horses and guns hauled on ropes.",
      "Mila rang the bell.",
      "She rang it so hard she came off the floor with every pull, and the whole city woke up, and people ran into the streets in their nightclothes to see.",
      "And that was when they saw the wings.",
      "On the high ground above everything else, drawn up in long silent lines, were horsemen with great arcs of eagle feathers rising off their backs, so that each man looked twice the size of a man. Their lances were longer than a house is wide. They did not move. They waited all day while the fighting went on below them, and the waiting was worse to watch than anything, because everyone knew what the waiting was for.",
      "In the late afternoon the wings came down the hill.",
      "Mila's grandmother, who was very old and had seen a great deal, put her hand over her mouth and said, \"Oh,\" once, and nothing else.",
      "The sound arrived before the riders did: the feathers going through the air, twenty thousand horses hitting the ground at once, a noise like a roof coming off the world. And then it was over, and the tents outside the wall were empty, and the tock under the floor had stopped for good.",
      "Afterwards, when Mila was grown, children would ask her about the wings. Were they magic? Did they fly?",
      "\"No,\" she would say. \"They were only feathers on a frame of wood. A man made them in a workshop.\"",
      "\"Then what were they for?\"",
      "And Mila would say: \"They were for me. So that a girl on a rooftop who had been listening to diggers for two months could look up and see something coming that was bigger than what she was afraid of.\"",
      "Then she would add the true part, which is the part the children never liked as much.",
      "\"Someone had to ride under them,\" she said. \"Feathers do not ride themselves.\"",
      "The end."
    ]
  },

  "wall-that-would-not-move": {
    title: "The Wall That Would Not Move",
    age: 3,
    minutes: "9",
    theme: "Obedience",
    origin: "New tale",
    brief: "tours",
    body: [
      "There was a boy called Odo who wanted, more than anything in the world, to do something.",
      "He had joined the army in spring. He had been given a spear, a shield taller than he was, and a place in the line. And then for six months he had been told to stand.",
      "Stand here. Shoulder against the man on your left. Shield locked against the man on your right. Do not step forward. Do not step back. Stand.",
      "\"When do we fight?\" he asked the old soldier beside him.",
      "\"We are fighting,\" said the old soldier.",
      "\"We are standing.\"",
      "\"Yes,\" said the old soldier. \"Well done.\"",
      "Now they were on a hill in the cold, in the trees, and at the bottom of the hill was an army with horses, and the horses were the finest anyone had ever seen. They shone. Odo had never wanted anything the way he wanted a horse like that.",
      "For seven days the two armies looked at each other and nothing happened.",
      "Odo thought he would go mad. \"Why don't we attack?\"",
      "\"Because down there they have horses and up here we have trees,\" said the old soldier. \"So we wait until they get tired of the trees.\"",
      "\"And what if they never come?\"",
      "\"Then we have won without anyone dying, which is the best kind of winning, and nobody will ever write it down.\"",
      "On the eighth morning they came.",
      "Odo heard them before he saw them, and the sound was not like anything. The ground did it first, a shaking that came up through his boots and into his teeth, and then the horses were through the trees and coming up the slope, and they were enormous, and they were not going to stop.",
      "Everything in Odo said run.",
      "It said it very clearly and very reasonably. It said: you are sixteen, and that is a horse, and a horse weighs more than your whole family, and behind you there is a great deal of empty ground with nobody on it.",
      "He felt the man on his left. He felt the man on his right. Their shoulders were against his, and if he went, the wall had a hole in it, and the hole would be exactly where his friends were standing.",
      "So he stood.",
      "He did not stand bravely. He stood with his eyes mostly shut and a noise coming out of him that he was not proud of afterwards. But his feet did not move, and the shield stayed up, and on either side of him the shoulders stayed where they were.",
      "The horses hit the wall.",
      "And the wall did not move.",
      "They came again. And again. And each time the shields closed back over the gaps like water, and by afternoon the horses would not come up the hill any more, because horses are sensible animals and will not run into a thing that does not give.",
      "That night Odo sat by a fire with his hands shaking so much he could not hold his bread.",
      "\"I didn't do anything,\" he said, ashamed. \"I just stood there.\"",
      "The old soldier looked at him for a long moment.",
      "\"Son,\" he said, \"a wall is not a thing. A wall is a lot of people who all decided not to move at the same time.\"",
      "He handed Odo back his bread.",
      "\"You were the wall,\" he said. \"Now eat.\"",
      "The end."
    ]
  },

  "egg-and-the-dome": {
    title: "The Egg and the Dome",
    age: 3,
    minutes: "9",
    theme: "Courage",
    origin: "Retold",
    brief: "dome",
    body: [
      "Once there was a city with a hole in it.",
      "Not a small hole. The city had built itself the most beautiful church anyone had ever seen, with marble the colour of cream and roses, and when they got to the top they discovered a problem.",
      "They had left a space for the roof that was too big for a roof.",
      "So the church stood there with the sky coming in. When it rained, it rained inside. Pigeons lived in it. Children were born, grew up, got married and had children of their own, and the hole was still there, and everyone had stopped noticing it, which is what happens to problems that stay long enough.",
      "The city called for a builder. Builders came from everywhere.",
      "The first said: build a mountain of earth inside the church, right up to the top, lay the roof on the mountain, then dig the mountain out. The city said, and who digs it out? The builder said, put coins in the earth and the people of the city will dig it out for free looking for them. The city thought about this for a while, which tells you how desperate they were.",
      "The second said: build a forest of wooden scaffolding from the floor to the sky. The city asked how much wood. The builder told them. There was not that much wood in the whole country.",
      "And then a small bad-tempered man named Filippo said, \"I can build it with no scaffolding at all.\"",
      "Everyone laughed.",
      "\"Tell us how,\" they said.",
      "\"No,\" said Filippo.",
      "This caused an enormous fuss. They shouted at him. They called him a fraud. Two of them picked him up and carried him out of the room, which had happened to him before.",
      "He came back the next day.",
      "\"If I tell you how,\" he said, \"you will thank me politely and give the work to your cousin.\"",
      "Then he asked for an egg.",
      "Someone fetched one, mostly out of curiosity. Filippo set it on the marble table and said, \"Whoever can stand this egg upright can build the dome.\"",
      "They all tried. Of course they did. They tipped it and steadied it and held their breath and let go, and it rolled over, every time, because that is what eggs do.",
      "When they had all failed, Filippo picked up the egg and cracked it, hard, straight down on the marble, so the bottom went flat.",
      "It stood up.",
      "The room went very quiet, and then very loud. \"Anyone could do that,\" they shouted. \"We could all have done that.\"",
      "\"Yes,\" said Filippo. \"And that is exactly what you will say about the dome, on the day I tell you how.\"",
      "They gave him the work.",
      "It took sixteen years. He laid the bricks in a pattern that held itself up as it went, so that every morning the dome was strong enough to stand on and build a little more, and he never built one single piece of scaffolding. He sent wine and bread up to the workmen so they would not have to climb down at noon, and he watered the wine, because he was not a fool.",
      "And when it was done, the biggest dome in the world stood over the city with no hole in it at all, and people said, well, obviously. You just lay the bricks so they hold themselves up.",
      "Filippo is buried underneath it.",
      "For five hundred years nobody knew quite where, because he never told them that either.",
      "The end."
    ]
  },

  "king-who-burnt-the-bread": {
    title: "The King Who Burnt the Bread",
    age: 1,
    minutes: "8",
    theme: "Mercy",
    origin: "Retold",
    brief: "athelney",
    body: [
      "Once there was a king with nothing.",
      "He had been a king with a crown and a hall and a great many horses. Then the winter came, and the men with the long ships came with it, and now he had a wet cloak, a marsh full of reeds, and six tired friends.",
      "He knocked on the door of a little house.",
      "A woman opened it. She did not know he was a king. He looked like a wet man.",
      "\"Come in,\" she said, \"but you shall be useful.\"",
      "She was baking. There were loaves on the hot stone by the fire, and she had to go out to the pigs.",
      "\"Watch the bread,\" she said. \"Turn it when it browns. Do not let it burn.\"",
      "\"I will watch the bread,\" said the king.",
      "And he sat down by the fire, and he looked at the bread.",
      "And then he stopped looking at the bread.",
      "Because he was thinking about the hall he had lost, and the friends he had lost, and the hundred difficult things a king thinks about, and while he was thinking the bread went brown, and then dark brown, and then black, and the little house filled up with smoke.",
      "The woman came back.",
      "\"Oh!\" she said. \"You useless man. You will eat my bread quick enough when it is ready, and you cannot even turn it.\"",
      "The king's friends jumped up. They opened their mouths to say: woman, do you know who this is.",
      "The king held up his hand.",
      "\"She is right,\" he said. \"I said I would watch the bread, and I did not watch the bread.\"",
      "And he took the burnt loaves off the stone, and he scraped them, and he ate the black bits himself, and he did not let anyone tell her.",
      "In the spring the king went back out into the world and did a great many large things, and won, and afterwards people would ask him about the winning.",
      "But he liked telling the other story better.",
      "\"I was king of nothing at all,\" he would say, \"and a woman told me off for burning her bread, and she was quite right to.\"",
      "And then he would laugh, and ask for more bread, and turn it himself.",
      "The end."
    ]
  },

  "farmer-who-was-king-for-sixteen-days": {
    title: "The Farmer Who Was King for Sixteen Days",
    age: 1,
    minutes: "8",
    theme: "Obedience",
    origin: "Retold",
    brief: "cincinnatus",
    body: [
      "Once there was a farmer with a small field and an old plough.",
      "He had four acres. He had a wife called Racilia. He had a hut, and a hat, and a great deal of digging to do, and that was the whole of it.",
      "One morning he was in the middle of the field when he saw men coming up the road.",
      "They were important men. You could tell, because they were walking carefully to keep the mud off.",
      "\"Is everything all right?\" the farmer called.",
      "\"No,\" they said. \"Everything is wrong. The army is trapped in a valley and cannot get out.\"",
      "The farmer put down the plough.",
      "\"Racilia,\" he called, \"bring me my good cloak. I cannot hear bad news in my shirt.\"",
      "So she brought it, and he put it on over the mud, and the important men bowed and said:",
      "\"The city has made you its master. Everyone must do what you say. Everyone.\"",
      "\"For how long?\" said the farmer.",
      "\"Six months.\"",
      "\"That is far too long,\" said the farmer. \"Let us go.\"",
      "He walked into the city and called out every man who could carry something, and he told them each to bring food for five days and twelve wooden stakes, and they marched all night in the dark.",
      "And when they got to the valley, the farmer did not shout, and he did not charge.",
      "He said: \"Dig.\"",
      "So they dug, quietly, all the way around the enemy in a great ring, and they put the stakes in the top.",
      "And in the morning the enemy woke up and found that while they had been busy trapping the army, somebody had trapped them.",
      "They gave up before lunch.",
      "The farmer let every single one of them go home. He only made them stoop as they went, under a little doorway of spears, so they would remember to be sorry.",
      "Then he walked back to the city, and everyone cheered, and they gave him a parade, and they offered him a great house and a great deal of gold.",
      "\"No, thank you,\" said the farmer. \"I have a field.\"",
      "And he gave back the power, all of it, on the sixteenth day, with five months still to go.",
      "And he went home, and he picked up the plough, and he finished the row he had started.",
      "The end."
    ]
  },

  "dragon-under-the-hill-1": {
    title: "The Dragon Under the Hill",
    age: 3,
    minutes: "8",
    theme: "Dragons",
    origin: "New tale",
    night: { n: 1, of: 3 },
    series: "dragon-under-the-hill",
    body: [
      "There was a hill at the end of the village, and there was a rule about it.",
      "The rule was: do not dig on the hill.",
      "Nobody could say why. The grandmothers said it, and their grandmothers had said it, and the rule had been handed down so many times that it had worn smooth, like a stone in a river, and lost its reason somewhere along the way.",
      "Wren was eleven, and she kept goats, and she thought the rule was silly.",
      "\"It is only a hill,\" she said.",
      "\"It is only a rule,\" said her grandmother, \"until it isn't.\"",
      "That summer was the dry one. The stream went thin, then went to a trickle, then went to a line of wet stones, and the village dug three wells and found nothing in any of them.",
      "And Wren, sitting on the hill at dusk with her goats, put her hand flat on the ground and felt it.",
      "Warm.",
      "Not sun-warm. The sun had been down an hour. This was a warmth that came up out of the hill, steady, like the side of a sleeping animal.",
      "She put her ear to the grass.",
      "And far down, so far that she thought at first it was her own blood in her own ear, something was breathing.",
      "In. Out. Slow as weather.",
      "Wren sat up. The goats had all stopped eating and were looking at her.",
      "She thought about the wells, and the dry stream, and the fact that a thing which breathes must, sooner or later, drink.",
      "Then she went down the hill and told nobody, which was the second mistake, and got a shovel, which was the first.",
      "Tomorrow night: what Wren found three feet down, and why the hill was warm.",
      "Goodnight."
    ]
  },

  "dragon-under-the-hill-2": {
    title: "The Dragon Under the Hill",
    age: 3,
    minutes: "8",
    theme: "Dragons",
    origin: "New tale",
    night: { n: 2, of: 3 },
    series: "dragon-under-the-hill",
    body: [
      "Wren dug at night, because she was not a fool, only stubborn, and those are different things.",
      "A foot down, ordinary dirt.",
      "Two feet down, warm dirt.",
      "Three feet down, the shovel rang.",
      "She cleared it with her hands. It was not rock. It was a curve of something the colour of an old coin, as wide across as a cartwheel, and when she touched it, it was as warm as a loaf out of the oven, and it moved very slightly under her palm.",
      "In. Out.",
      "A scale. One scale.",
      "Wren sat down in the hole rather suddenly.",
      "And a voice came up through the ground, not loud, and not unkind, and enormously tired.",
      "\"You have woken me,\" it said, \"four hundred years early.\"",
      "Wren could not get any words out.",
      "\"Do not apologise,\" said the voice. \"Apologies take air. I have very little air. Listen.\"",
      "So she listened.",
      "\"I did not come here to sleep,\" the dragon said. \"I came here to be a roof. Under this hill there is water. All the water in this valley, everything your wells are looking for, is held in a cave beneath me, and if I move, the cave falls in, and the water runs away into the deep rock where nobody will ever find it again.\"",
      "\"So you are lying on the water,\" said Wren.",
      "\"I am holding up the ceiling,\" said the dragon. \"For four hundred years. It is not a heroic job. Nobody sings about it. But I am the only one here who is big enough to do it, so I do it.\"",
      "\"Then why did anyone make a rule about digging?\"",
      "The dragon was quiet a moment.",
      "\"Because a scale is a very small door,\" it said. \"And you have just opened one.\"",
      "Wren looked down. Around the edge of the scale she had uncovered, the dry earth was going dark.",
      "Water was coming up. And that was worse than it sounds, because water that is coming up is water that is coming out.",
      "Tomorrow night: what Wren had to carry up the hill, and what the whole village had to do before morning.",
      "Goodnight."
    ]
  },

  "dragon-under-the-hill-3": {
    title: "The Dragon Under the Hill",
    age: 3,
    minutes: "9",
    theme: "Dragons",
    origin: "New tale",
    night: { n: 3, of: 3 },
    series: "dragon-under-the-hill",
    body: [
      "Wren ran down the hill in the dark and woke the whole village up, and told them the truth, all of it, including the shovel.",
      "They were not pleased.",
      "\"You dug on the hill,\" said the baker.",
      "\"I dug on the hill,\" said Wren.",
      "\"There is a rule about the hill.\"",
      "\"There is now a hole in the hill,\" said Wren, \"and the hole is getting wet, and you can be angry at me tomorrow. Bring clay.\"",
      "And here is the surprising part, and the part Wren remembered all her life: they brought the clay.",
      "Not because they forgave her. They were extremely cross, and several of them said so the entire time. But being cross and being useful turn out to be two jobs a person can do at once, and the village did both, all night, up and down the hill in the dark with buckets.",
      "They packed the clay around the edge of the scale and stamped it down, layer on layer, and the water slowed, and stopped, and the dark patch on the ground dried back to brown.",
      "By dawn the hill was a hill again, with a slightly flatter patch on one side.",
      "Wren stayed until the sun came up, with her ear against the grass.",
      "\"Is it holding?\" she asked.",
      "\"It is holding,\" said the dragon. \"Go to sleep.\"",
      "\"I am sorry,\" said Wren.",
      "\"I know.\"",
      "\"Can I come back?\"",
      "There was a long pause, and the hill breathed in and out.",
      "\"Every rule you were given,\" said the dragon, \"is somebody's grandmother trying to shout at you across four hundred years. They cannot tell you why any more. The why gets lost. All that arrives is the rule.\"",
      "\"That is not very fair,\" said Wren.",
      "\"No,\" agreed the dragon. \"So here is what you will do. You will be the why. You will tell them what is under this hill, and they will not believe you, and you will tell them anyway, and when you are a grandmother you will tell it again.\"",
      "\"And if they still don't believe me?\"",
      "\"Then at least,\" said the dragon, \"they will have a better rule.\"",
      "Wren went down the hill.",
      "She told them. Some of them believed her. Most of them did not.",
      "But that autumn the village dug a new well at the bottom of the slope, well away from the top, exactly where Wren said the water would be, and it came up cold and clean and it never once ran dry.",
      "And the rule changed. It is still the rule there today, and it is a longer rule than it used to be, and children complain about having to learn all of it.",
      "It goes: do not dig on the hill, because something is holding up the water, and it is tired, and it has been doing it since before your great-great-grandmother, and it never once asked for a song.",
      "The end."
    ]
  },

  "forest-that-remembered": {
    title: "The Forest That Remembered",
    age: 1,
    minutes: "8",
    theme: "Forests",
    origin: "New tale",
    body: [
      "There was a forest that remembered everything.",
      "It remembered the deer that walked through it on Tuesday. It remembered the fox. It remembered a boy who had come in with a red hat forty years ago and gone out again without it.",
      "The forest kept the hat.",
      "One day a small girl came in, and she was lost, and she sat down on a root and cried.",
      "The forest thought about this.",
      "Then it did the only thing a forest can do, which is not very much, but is not nothing.",
      "It dropped an acorn on her head.",
      "\"Ow,\" said the girl.",
      "She looked up. She looked down. And there, by her foot, was the acorn, and beside the acorn was a path she had not noticed, because she had been busy crying, which makes even large things hard to see.",
      "She got up and followed the path.",
      "The path went past a stone the shape of a loaf of bread. It went over a small brown stream with three flat stepping stones. It went under a branch she had to duck for, and she ducked.",
      "And then the trees stopped, and there was the field, and there was the gate, and there was her mother, coming fast.",
      "The girl went home and had her supper and went to bed.",
      "And the forest, being a forest, remembered.",
      "It remembered the stone like a loaf. It remembered the three flat stones in the stream. It remembered the branch you have to duck for.",
      "And it kept them all exactly where they were, for a very long time, in case she ever came back.",
      "She did. She was eighty-one.",
      "She ducked.",
      "Goodnight."
    ]
  }
};

/* ----------------------------------------------------------------- cards */
/* Newest last. Two a week. */

const CARDS = [
  {
    date: "2026-09-03",
    title: "The Plough He Went Back To",
    brief: "cincinnatus",
    tale: "farmer-who-was-king-for-sixteen-days",
    question: "If you were in charge of everything for one day, what would you do first, and when would you stop?",
    whyOurs: "Power handed back is worth more than power taken, and we hand ours back at the end of the day too.",
    prayer: "Keep our hands ready for the work in front of us, and light enough to let it go."
  },
  {
    date: "2026-09-07",
    title: "The King in the Marsh",
    brief: "athelney",
    tale: "king-who-burnt-the-bread",
    question: "Somebody told the king off and he said sorry. When is it hardest for you to say sorry?",
    whyOurs: "The strong man who takes the blame for the burnt bread is the model we were handed, and we have not improved on it.",
    prayer: "For a quiet heart when we are corrected, and a short memory for the correcting."
  },
  {
    date: "2026-09-10",
    title: "The Hammer",
    brief: "tours",
    tale: "wall-that-would-not-move",
    question: "Odo wanted to run. What is something you did even though you were scared?",
    whyOurs: "We stand where we are put, shoulder to shoulder, because the gap we leave is always in front of somebody we love.",
    prayer: "Hold us steady tonight, and hold the ones standing beside us."
  },
  {
    date: "2026-09-14",
    title: "The Man Who Would Not Say How",
    brief: "dome",
    tale: "egg-and-the-dome",
    question: "What is something that looks easy once somebody has shown you how?",
    whyOurs: "We build things we will not see finished, and we put our names on none of them.",
    prayer: "For the patience to lay one row today, and to leave the top of it to somebody else."
  },
  {
    date: "2026-09-17",
    title: "The Morning the Hill Moved",
    brief: "vienna",
    tale: "riders-with-wings",
    question: "Mila's job was to watch. What is a small job you can do that nobody else is doing?",
    whyOurs: "Help came over the mountain for people who had run out of reasons to expect it, and that is the shape of the thing we believe.",
    prayer: "Be the light on the hill for anyone who is listening at the floor tonight."
  },
  {
    date: "2026-09-21",
    title: "The Day the Sea Went Quiet",
    brief: "lepanto",
    tale: "boy-who-counted-oars",
    question: "The rowers could have stopped and nobody would have known. What do you do well when nobody is watching?",
    whyOurs: "A man went down among the chained and knelt in the filth to strike the irons off, and we have been trying to copy him ever since.",
    prayer: "For everyone still on a bench tonight, and for the hands that will come with the hammer."
  }
];

/* -------------------------------------------------------- today in history */
/* Keyed "MM-DD". 100 to 150 words each. */

const TODAY = {
  "09-12": {
    year: "1683",
    text: "The largest cavalry charge in history came down the Vienna Woods in the late afternoon. Vienna had been under siege for two months, and the siege was not being fought at the walls but underneath them, with tunnels packed with gunpowder creeping closer every day. The relief army dragged its guns over forested ridges nobody thought an army could cross. John III Sobieski of Poland put twenty thousand horsemen on the high ground and waited until the infantry had ground its way down the vineyards. Three thousand of them were winged hussars, carrying lances nineteen feet long and wearing frames of eagle feathers on their backs. The Ottoman line did not break so much as come apart. Within three hours Sobieski was standing in the Grand Vizier's tent.",
    brief: "vienna",
    tale: "riders-with-wings"
  },
  "09-20": {
    year: "1519",
    text: "Five ships left Sanlúcar de Barrameda in Spain with about 270 men, intending to reach the Spice Islands by sailing west. Ferdinand Magellan was Portuguese, working for the Spanish crown, which made him distrusted by both. The voyage went about as well as that suggests. One ship wrecked, one deserted and sailed home, and Magellan himself was killed in the Philippines in 1521. Three years and one month later, a single ship called the Victoria came back into the same river with eighteen men aboard, so thin the harbour crew did not recognise them. They had gone all the way round. They were also, they discovered on landing, one day out on their calendar, which is how Europe learned the world owes you a day if you chase the sun far enough."
  },
  "09-21": {
    year: "19 BC",
    text: "Virgil died at Brundisium, coming home from Greece with a fever. He had spent eleven years on the Aeneid and considered it unfinished. About sixty lines in it are still incomplete, breaking off mid-sentence, and you can find them in any edition today. His instruction, given on his deathbed, was that the manuscript should be burned. His friends refused, and the emperor Augustus personally overruled him and ordered it published. So the most influential poem in Latin exists because two people ignored a dying man's last request. Dante made him the guide through hell and purgatory thirteen centuries later, and for most of the Middle Ages people opened him at random to tell fortunes, which he would have hated.",
    tale: null
  },
  "09-22": {
    year: "1776",
    text: "Nathan Hale was hanged in Manhattan as a spy. He was twenty-one, a schoolteacher from Connecticut, and he had volunteered for a job every other officer had declined because he was the only one who did not consider it beneath him. He was extremely bad at it. He went behind British lines in civilian clothes with no training, no contacts, no cover story worth the name, and his own Yale diploma in his pocket. He was caught within a week. The famous line about regretting that he had but one life to lose was reported by a British officer who was there, and is probably a paraphrase of a play by Joseph Addison that every educated man of that generation had read. He said something like it, standing on the ladder, and then they hanged him."
  },
  "10-07": {
    year: "1571",
    text: "Two fleets of oared galleys met in the Gulf of Patras and fought for four hours at close quarters, ships grappled together so that men crossed from deck to deck as if the sea had been paved. Around 140,000 men were there, and most of them had not chosen to be: the engines of these ships were rowers, three or four to an oar, usually chained at the ankle. Before the fighting, Don John of Austria had the chains struck off his own rowers and promised them their freedom. When it ended, some twelve thousand Christian galley slaves came off the benches alive and free. A wounded Spanish soldier named Cervantes lost the use of his left hand there and spent the rest of his life proud of it.",
    brief: "lepanto",
    tale: "boy-who-counted-oars"
  },
  "10-10": {
    year: "732",
    text: "Charles, mayor of the palace of the Franks, spent seven days on a wooded hill near Poitiers refusing to come down, and won the battle largely because of it. His opponents were cavalry, and cavalry needs an enemy line that breaks. Charles had built something nobody else in the West had, a standing army of professional infantry, paid for by confiscating church land, which made him permanently unpopular with the men who wrote the histories. He formed them into a square on high ground among the trees and made them stand. A chronicler wrote that they stood like a wall, like a belt of ice frozen together. The cavalry came up the hill eight days running and could not break it. Charles was called Martel afterwards: the Hammer.",
    brief: "tours",
    tale: "wall-that-would-not-move"
  },
  "05-12": {
    year: "878",
    text: "Alfred of Wessex came out of the Somerset marshes. In January he had lost his kingdom to a surprise attack during the twelve days of Christmas and escaped into a flooded swamp with a handful of men. He spent three months on an island at Athelney, raiding for food, while the rest of England assumed he was dead. In May he sent word through the shire levies to meet him at Egbert's Stone, and men came from Somerset, Wiltshire and Hampshire and, one chronicler says, rejoiced to see him. Two days later he broke the Danish army at Edington. Then he did the strange thing that made him Great: he stood godfather at his enemy's baptism, gave him gifts, and sent him home to rule under a treaty.",
    brief: "athelney",
    tale: "king-who-burnt-the-bread"
  },
  "08-07": {
    year: "1420",
    text: "Work began on the dome of Florence cathedral, fifty-three years after the city approved a design nobody knew how to build. The church had stood with an octagonal hole in its roof, a hundred and forty feet up and open to the weather, for so long that people had stopped noticing. Every known method needed a wooden skeleton to hold the masonry until it set, and there was not enough timber in Tuscany. Filippo Brunelleschi said he could do it without one and refused to explain how, on the grounds that he would be thanked and then dismissed. He was right about that. It took sixteen years and four million bricks, laid in a herringbone pattern that locked each course so the dome held itself up as it rose.",
    brief: "dome",
    tale: "egg-and-the-dome"
  },
  "07-04": {
    year: "458 BC",
    text: "The traditional date for the Senate delegation that crossed the Tiber to a four-acre farm and found a former consul at the plough. A Roman army was trapped in a valley. The Republic had a trapdoor for emergencies: one man, total authority, expiring automatically after six months. Cincinnatus asked whether everything was all right, sent his wife for his toga so he could hear the news decently dressed, and took the job. He called up every man of military age, ordered each to bring five days of food and twelve stakes, marched through the night, and had his men dig a ring around the enemy while they slept. They surrendered by the next afternoon. He resigned on the sixteenth day, with five months of absolute power unused, and went home.",
    brief: "cincinnatus",
    tale: "farmer-who-was-king-for-sixteen-days"
  },
  "12-25": {
    year: "800",
    text: "Charlemagne was crowned emperor in Rome, which he claimed afterwards had been a complete surprise and that he would not have gone into the church that day if he had known. Nobody has ever quite believed him. His biographer Einhard, who knew him well, reports the line with a straight face and lets the reader decide. He was the grandson of Charles Martel, the man who had stood on the hill at Poitiers, and the family had gone in three generations from palace officials running the government on behalf of do-nothing kings to emperors in their own right. He was about fifty-eight, he could read but reportedly never mastered writing, and he kept wax tablets under his pillow to practise letters when he could not sleep."
  }
};
