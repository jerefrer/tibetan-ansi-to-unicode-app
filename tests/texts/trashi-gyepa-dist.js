"use strict";

testGroups.push({
  name: 'Trashi Gyepa',
  includeInPercentage: true,
  sentences: true,
  tests: [{
    tibetan: 'ༀ།',
    conversion: ">\xF9\xCA"
  }, {
    tibetan: 'སྣང་སྲིད་རྣམ་དག་རང་བཞིན་ལྷུན་གྲུབ་པའི། །',
    conversion: "[$-r\xDC+-F0-+#-9$-/5\xDC,-T\xA9,-i\xE1/-\xFD7\xDC\xCA \xCA"
  }, {
    tibetan: 'བཀྲ་ཤིས་ཕྱོགས་བཅུའི་ཞིང་ན་བཞུགས་པ་ཡི། །',
    conversion: "/g-;\xDC<-d\xEB#<-/%\xB07\xDC-5\xDC$-,-/\xBA\xA5#<-\xFD-8\xDC\xCA \xCA"
  }, {
    tibetan: 'སངས་རྒྱས་ཆོས་དང་དགེ་འདུན་འཕགས་པའི་ཚོགས། །',
    conversion: "<$<-{<-&\xEB<-+$-+#\xE8-7\xB8\xA5,-7.#<-\xFD7\xDC-2\xEC#<\xCA \xCA"
  }, {
    tibetan: 'ཀུན་ལ་ཕྱག་འཚལ་བདག་ཅག་བཀྲ་ཤིས་ཤོག །',
    conversion: "\xB4\xA5,-:-d#-72:-/+#-%#-/g-;\xDC<-;\xEB# \xCA"
  }, {
    tibetan: 'སྒྲོལ་མའི་རྒྱལ་པོ་རྩལ་བརྟན་དོན་གྲུབ་དགོངས། །',
    conversion: "\u2026\xEB:-07\xDC-{:-\xFD\xEB-I:-/D,-+\xEB,-i\xE1/-+#\xEB$<\xCA \xCA"
  }, {
    tibetan: 'བྱམས་པའི་རྒྱན་དཔལ་དགེ་གྲགས་དཔལ་དམ་པ། །',
    conversion: "e0<-\xFD7\xDC-{,-+\xFD:-+#\xE8-i#<-+\xFD:-+0-\xFD\xCA \xCA"
  }, {
    tibetan: 'ཀུན་ལ་དགོངས་པ་རྒྱ་ཆེར་གྲགས་པ་ཅན། །',
    conversion: "\xB4\xA5,-:-+#\xEB$<-\xFD-{-&\xE89-i#<-\xFD-%,\xCA \xCA"
  }, {
    tibetan: 'ལྷུན་པོ་ལྟར་འཕགས་རྩལ་གྲགས་དཔལ་དང་ནི། །',
    conversion: "T\xA9,-\xFD\xEB-P9-7.#<-I:-i#<-+\xFD:-+$-,\xDC\xCA \xCA"
  }, {
    tibetan: 'སེམས་ཅན་ཐམས་ཅད་ལ་དགོངས་གྲགས་པའི་དཔལ། །',
    conversion: "<\xE80<-%,-*0<-%+-:-+#\xEB$<-i#<-\xFD7\xDC-+\xFD:\xCA \xCA"
  }, {
    tibetan: 'ཡིད་ཚིམ་མཛད་པ་རྩལ་རབ་གྲགས་དཔལ་ཏེ། །',
    conversion: "8\xDC+-2\xDD0-03+-\xFD-I:-9/-i#<-+\xFD:-)\xE8\xCA \xCA"
  }, {
    tibetan: 'མཚན་ཙམ་ཐོས་པས་བཀྲ་ཤིས་དཔལ་འཕེལ་བ། །',
    conversion: "02,-10-*\xEB<-\xFD<-/g-;\xDC<-+\xFD:-7.\xE8:-/\xCA \xCA"
  }, {
    tibetan: 'བདེ་བར་གཤེགས་པ་བརྒྱད་ལ་ཕྱག་འཚལ་ལོ། །',
    conversion: "/+\xE8-/9-#;\xE8#<-\xFD-/{+-:-d#-72:-:\xEB\xCA \xCA"
  }, {
    tibetan: 'འཇམ་དཔལ་གཞོན་ནུ་དཔལ་ལྡན་རྡོ་རྗེ་འཛིན། །',
    conversion: "7'0-+\xFD:-#5\xEB,-\xB9\xA5-+\xFD:-Q,-E\xEB-B\xE8-73\xDD,\xCA \xCA"
  }, {
    tibetan: 'སྤྱན་རས་གཟིགས་དབང་མགོན་པོ་བྱམས་པའི་དཔལ། །',
    conversion: "\x81,-9<-#6\xDC#<-+/$-0#\xEB,-\xFD\xEB-e0<-\xFD7\xDC-+\xFD:\xCA \xCA"
  }, {
    tibetan: 'ས་ཡི་སྙིང་པོ་སྒྲིབ་པ་རྣམ་པར་སེལ། །',
    conversion: "<-8\xDC-X\xDC$-\xFD\xEB-\u2026\xDC/-\xFD-F0-\xFD9-<\xE8:\xCA \xCA"
  }, {
    tibetan: 'ནམ་མཁའི་སྙིང་པོ་འཕགས་མཆོག་ཀུན་ཏུ་བཟང་། །',
    conversion: ",0-0\"7\xDC-X\xDC$-\xFD\xEB-7.#<-0&\xEB#-\xB4\xA5,-\xB7\xE2-/6$-\xCA \xCA"
  }, {
    tibetan: 'ཨུཏྤལ་རྡོ་རྗེ་པད་དཀར་ཀླུ་ཤིང་དང་། །',
    conversion: ">\xDF,:-E\xEB-B\xE8-\xFD+-+!9-t\xE4-;\xDC$-+$-\xCA \xCA"
  }, {
    tibetan: 'ནོར་བུ་ཟླ་བ་རལ་གྲི་ཉི་མ་ཡི། །',
    conversion: ",\xEB9-/\xDF-w-/-9:-i\xDC-(\xDC-0-8\xDC\xCA \xCA"
  }, {
    tibetan: 'ཕྱག་མཚན་ལེགས་བསྣམས་བཀྲ་ཤིས་དཔལ་གྱི་མཆོག །',
    conversion: "d#-02,-:\xE8#<-/[0<-/g-;\xDC<-+\xFD:-b\xDC-0&\xEB# \xCA"
  }, {
    tibetan: 'བྱང་ཆུབ་སེམས་དཔའ་བརྒྱད་ལ་ཕྱག་འཚལ་ལོ། །',
    conversion: "e$-&\xB1/-<\xE80<-+\xFD7-/{+-:-d#-72:-:\xEB\xCA \xCA"
  }, {
    tibetan: 'རིན་ཆེན་གདུགས་མཆོག་བཀྲ་ཤིས་གསེར་གྱི་ཉ། །',
    conversion: "9\xDC,-&\xE8,-#\xB8\xA5#<-0&\xEB#-/g-;\xDC<-#<\xE89-b\xDC-(\xCA \xCA"
  }, {
    tibetan: 'འདོད་འབྱུང་བུམ་བཟང་ཡིད་འོང་ཀ་མ་ལ། །',
    conversion: "7+\xEB+-7e\xB3$-/\xDF0-/6$-8\xDC+-7\xEB$-!-0-:\xCA \xCA"
  }, {
    tibetan: 'སྙན་གྲགས་དུང་དང་ཕུན་ཚོགས་དཔལ་བེའུ། །',
    conversion: "X,-i#<-\xB8\xA5$-+$-.\xDF,-2\xEC#<-+\xFD:-/\xE87\xDF\xCA \xCA"
  }, {
    tibetan: 'མི་ནུབ་རྒྱལ་མཚན་དབང་བསྒྱུར་འཁོར་ལོ་སྟེ། །',
    conversion: "0\xDC-\xB9\xA5/-{:-02,-+/$-/\u20AC\xE79-7\"\xEB9-:\xEB-Y\xE8\xCA \xCA"
  }, {
    tibetan: 'རིན་ཆེན་རྟགས་མཆོག་བརྒྱད་ཀྱི་ཕྱག་མཚན་ཅན། །',
    conversion: "9\xDC,-&\xE8,-D#<-0&\xEB#-/{+-`\xDC-d#-02,-%,\xCA \xCA"
  }, {
    tibetan: 'ཕྱོགས་དུས་རྒྱལ་བ་མཆོད་ཅིང་དགྱེས་བསྐྱེད་མ། །',
    conversion: "d\xEB#<-\xB8\xA5<-{:-/-0&\xEB+-%\xDC$-+b\xE8<-/\xFE\xE8+-0\xCA \xCA"
  }, {
    tibetan: 'སྒེགས་སོགས་ངོ་བོ་དྲན་པའི་དཔལ་འཕེལ་བ། །',
    conversion: "V\xE8#<-<\xEB#<-$\xEB-/\xEB-l,-\xFD7\xDC-+\xFD:-7.\xE8:-/\xCA \xCA"
  }, {
    tibetan: 'བཀྲ་ཤིས་ལྷ་མོ་བརྒྱད་ལ་ཕྱག་འཚལ་ལོ། །',
    conversion: "/g-;\xDC<-T-0\xEB-/{+-:-d#-72:-:\xEB\xCA \xCA"
  }, {
    tibetan: 'ཚངས་པ་ཆེན་པོ་བདེ་འབྱུང་སྲེད་མེད་བུ། །',
    conversion: "2$<-\xFD-&\xE8,-\xFD\xEB-/+\xE8-7e\xB3$-r\xE8+-0\xE8+-/\xDF\xCA \xCA"
  }, {
    tibetan: 'མིག་སྟོང་ལྡན་དང་རྒྱལ་པོ་ཡུལ་འཁོར་སྲུང་། །',
    conversion: "0\xDC#-Y\xEB$-Q,-+$-{:-\xFD\xEB-8\xDF:-7\"\xEB9-r\xE1$-\xCA \xCA"
  }, {
    tibetan: 'འཕགས་སྐྱེས་པོ་དང་ཀླུ་དབང་མིག་མི་བཟང་། །',
    conversion: "7.#<-\xFE\xE8<-\xFD\xEB-+$-t\xE4-+/$-0\xDC#-0\xDC-/6$-\xCA \xCA"
  }, {
    tibetan: 'རྣམ་ཐོས་སྲས་ཏེ་ལྷ་རྫས་འཁོར་ལོ་དང་། །',
    conversion: "F0-*\xEB<-r<-)\xE8-T-J<-7\"\xEB9-:\xEB-+$-\xCA \xCA"
  }, {
    tibetan: 'ཏྲི་ཤུ་ལ་དང་མདུང་ཐུང་རྡོ་རྗེ་ཅན། །',
    conversion: "j\xDC-\xBB\xA5-:-+$-0\xB8\xA5$-*\xDF$-E\xEB-B\xE8-%,\xCA \xCA"
  }, {
    tibetan: 'པི་ཝཾ་རལ་གྲི་མཆོད་རྟེན་རྒྱལ་མཚན་འཛིན། །',
    conversion: "\xFD\xDC-4\xEE-9:-i\xDC-0&\xEB+-D\xE8,-{:-02,-73\xDD,\xCA \xCA"
  }, {
    tibetan: 'ས་གསུམ་གནས་སུ་བཀྲ་ཤིས་དགེ་ལེགས་འཕེལ། །',
    conversion: "<-#<\xDF0-#,<-<\xDF-/g-;\xDC<-+#\xE8-:\xE8#<-7.\xE8:\xCA \xCA"
  }, {
    tibetan: 'འཇིག་རྟེན་སྐྱོང་བ་བརྒྱད་ལ་ཕྱག་འཚལ་ལོ། །',
    conversion: "7'\xDC#-D\xE8,-\xFE\xEB$-/-/{+-:-d#-72:-:\xEB\xCA \xCA"
  }, {
    tibetan: 'བདག་ཅག་དེང་འདིར་བྱ་བ་རྩོམ་པ་ལ། །',
    conversion: "/+#-%#-+\xE8$-7+\xDC9-e-/-I\xEB0-\xFD-:\xCA \xCA"
  }, {
    tibetan: 'བགེགས་དང་ཉེ་བར་འཚེ་བ་ཀུན་ཞི་ནས། །',
    conversion: "/#\xE8#<-+$-(\xE8-/9-72\xE9-/-\xB4\xA5,-5\xDC-,<\xCA \xCA"
  }, {
    tibetan: 'འདོད་དོན་དཔལ་འཕེལ་བསམ་དོན་ཡིད་བཞིན་འགྲུབ། །',
    conversion: "7+\xEB+-+\xEB,-+\xFD:-7.\xE8:-/<0-+\xEB,-8\xDC+-/5\xDC,-7i\xE1/\xCA \xCA"
  }, {
    tibetan: 'བཀྲ་ཤིས་བདེ་ལེགས་ཕུན་སུམ་ཚོགས་པར་ཤོག',
    conversion: "/g-;\xDC<-/+\xE8-:\xE8#<-.\xDF,-<\xDF0-2\xEC#<-\xFD9-;\xEB#"
  }]
});