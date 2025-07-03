/* GREEK TRANSLITERATOR */
//Match key and replace with value
function keyValueReplacer(str) {
    const greekTransliterationReplacementSET = {
        "au": ["αυ"],
        "hu": ["\bυ"],
        "au": ["αυ"],
        "eu": ["ευ"],
        "ou": ["ου"],
        "hu": ["ηυ"],
        "me": ["μὴ"],
        "ui": ["υι"],
        "ng": ["γγ"],
        "nch": ["γχ"],
        "nk": ["γκ"],
        "nx": ["γξ"],
        "th": ["θ"],
        "Th": ["Θ"],
        "ph": ["φ"],
        "Ph": ["Φ"],
        "ch": ["χ"],
        "Ch": ["Χ"],
        "ps": ["ψ"],
        "Ps": ["Ψ"],
        "A": ["Α"],
        "B": ["Β"],
        "G": ["Γ"],
        "D": ["Δ"],
        "E": ["Ε","Ἔ"],
        "Z": ["Ζ"],
        "H": ["Η"],
        "I": ["Ι"],
        "K": ["Κ"],
        "L": ["Λ"],
        "M": ["Μ"],
        "N": ["Ν"],
        "X": ["Ξ"],
        "O": ["Ο"],
        "P": ["Π"],
        "R": ["Ρ"],
        "S": ["Σ"],
        "T": ["Τ"],
        "Y": ["Υ"],
        "Ō": ["Ω"],
        "a": ["α","ὰ","ά","ᾶ","ᾰ","ᾱ"],
        "b": ["β"],
        "g": ["γ"],
        "d": ["δ"],
        "e": ["ε","ὲ","ἐ","ἔ"],
        "é": ["ἐ"],
        "z": ["ζ"],
        "ḗ": ["ή"],
        "ē": ["η"],
        "h": ["ὴ","ή","ῆ","ῃ"],
        "ḗ": ["ή"],
        "i": ["ι","ὶ","ϊ",'ΐ',"ῖ","ῐ","ῑ"],
        "k": ["κ"],
        "l": ["λ"],
        "m": ["μ"],
        "n": ["ν"],
        "x": ["ξ"],
        "o": ["ο","ὸ"],
        "p": ["π"],
        "r": ["ρ"],
        "s": ["σ","ς"],
        "t": ["τ"],
        "y": ["υ","ὺ","ύ","ϋ","ΰ","ῠ","ῡ"],
        "û": ["ῦ"],
        "ō": ["ω","ὧ","ῷ","ώ","ὼ","ῶ","ὠ"]
    }
    if(/[\u0590-\u05FF\u05B0-\u05BD]/.test(str)) {
        return transliterateHebrewToEnglish(str)
    }
    else{
        //GREEK to ENGLISH
        /* For Word Begining */
        str = str.replace(new RegExp(`\\b[υὑ]`, 'g'), 'hu')
        Object.keys(greekTransliterationReplacementSET).forEach(k => greekTransliterationReplacementSET[k].forEach(function (item) {
            str = str.replace(new RegExp(`${item}`, 'g'), k)
        }));
        return str;
    }

    /* HEBREW TRANSLITERATOR */
    function transliterateHebrewToEnglish(hebrewText) {
        const hebrewTransliterationMap = {
          //specialCases
          'אֲ': 'a', 'אֳ': 'o', 'אֱ': 'e', 'עֲ': 'a', 'עֳ': 'o', 'עֱ': 'e', 'עי': 'ay', 'עו': 'ao', 'עה': 'ah', 'עי־': 'ey-', 'עו־': 'ow-', 'עה־': 'ah-', 'נֵ֗י': 'nay',
          'בֲ': 'v',
          'בֳ': 'vo','בֱ': 've','גֲ': 'g','גֳ': 'go','גֱ': 'ge','חֲ': 'h','חֳ': 'ho','חֱ': 'he','כֲ': 'k','כֳ': 'ko','כֱ': 'ke','מֲ': 'm','מֳ': 'mo','מֱ': 'me','פֲ': 'f','פֳ': 'fo','פֱ': 'fe','צֲ': 'ts','צֳ': 'tso','צֱ': 'tse','קֲ': 'q','קֳ': 'qo','קֱ': 'qe','רֲ': 'r','רֳ': 'ro','רֱ': 're',
          'לְ':'lə',
          //single alphabets and punctuation marks
          'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z', 'ח': 'kh', 'ט': 't', 'י': 'y', 'כ': 'k', 'ל': 'l', 'מ': 'm', 'נ': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'צ': 'ts', 'ק': 'q', 'ר': 'r', 'ש': 'sh', 'ת': 't', 'ְ': '', 'ֱ': 'e', 'ֲ': 'a', 'ֳ': 'o', 'ִ': 'i', 'ֵ': 'e', 'ֶ': 'e', 'ַ': 'a', 'ָ': 'a', 'ֹ': 'o', 'ֻ': 'u', 'ּ': '', 'ֹּ': 'o'
        };
      
        const hebrewKeys = Object.keys(hebrewTransliterationMap);
        const hebrewPattern = hebrewKeys.map(key => key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
        const hebrewRegex = new RegExp(hebrewPattern, 'g');
      
        return hebrewText.replace(hebrewRegex, match => hebrewTransliterationMap[match] || match);
    }
}