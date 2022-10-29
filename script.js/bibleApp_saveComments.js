/* USIN THE FILE SYSTEM ACCESS API --(WORKS ONLY IN CHROMIUM BASED BROWSERS, E.G., EDGE, CHROME)*/

// store a reference to our file handle
let fileHandle;
let fileName; //File name should be bookName with .json extension, e.g., Romans.json
const pickerOpts = {
  // suggestedName: `Romans.json`,
  suggestedName: `${currentBookName}.json`,
  startIn: 'C:\Users\samue\OneDrive\Desktop\Folders on Desktop\LC Apps\LC BibleApp 2.0\bible_notes',
  types: [{
    description: 'Text Files',
    accept: {
      'text/plain': ['.json'],
    }
  }, ],
  excludeAcceptAllOption: true,
  multiple: false
};

//Get file
async function getFileToSaveTo() {
  [fileHandle] = await window.showOpenFilePicker(pickerOpts);
  let fileData = await fileHandle.getFile()
  let fileText = await fileData.text()
  // fileName = fileData.name; //get the file name to ensure that the file that is saved to is the edited file
  textarea.innerText = fileText;
  if (fileData.type == 'application\/json') {
    console.log(JSON.parse(fileText))
  }
  // console.log(fileData);
  // console.log(fileText);
  // console.log(fileName);
}
// Save to file
async function saveFile() {
  let stream = await fileHandle.createWritable(pickerOpts);
  await stream.write(textarea.innerText)
  await stream.close()
}

async function saveFileAs() {
  [fileHandle] = await window.showSaveFilePicker(pickerOpts);
  saveFile()
}