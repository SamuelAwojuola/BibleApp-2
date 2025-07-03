/* TABLE FILTER */
let filterInput = document.querySelector(".filter-input");// input element
const order = document.querySelectorAll(".order");//rows are given class order

filterInput.addEventListener('keyup', () => {
    // Only works for one criteria,
    // can be made to work for more by getting an array and
    // search items may be separated by semicolons
    //   let criteria = filterInput.value.toUpperCase().trim();
    
    let criteria_Arr = filterInput.value.toUpperCase().split(/\s*;\s*/).trim();
    let j = 0;

  order.forEach(data => {
    thead.style.opacity = "1";
    err.style.display = "";

    function hasAllStrings(){
        let hasAllStringsInArray = true;
        criteria_Arr.forEach(x=>{
            //checking if it does not have any of the strings in the array
            if(data.innerText.toUpperCase().indexOf(x) == -1){
                hasAllStringsInArray = false;
            }
        })
        return hasAllStringsInArray
    }

    // if (data.innerText.toUpperCase().indexOf(criteria) > -1) {
    if (hasAllStrings()) {
      data.style.display = "";
    } else {
      data.style.display = "none";
      j++;
      if (j === order.length) {
        thead.style.opacity = "0.2";
        err.style.display = "flex";
      }
    }
  });
});

/* TABLE SORTER */
let sortDirection;

th.forEach((col, idx) => {
  col.addEventListener("click", () => {
    sortDirection = !sortDirection;
    /** Remember:
     * We obtained all tr elements that has 'order' class before!
     * However, querySelectorAll returns a NodeList, not an Array.
     * While forEach method can be used on NodeLists, filter method cannot.
     * This is why we preferred to make this conversion below; where we actually need an array to filter.
     * Note: NoteList is very similar to array and easy to convert.
     **/
    const rowsArrFromNodeList = Array.from(order);
    const filteredRows = rowsArrFromNodeList.filter(
      item => item.style.display != "none"
    );

    filteredRows
      .sort((a, b) => {
        return a.childNodes[idx].innerHTML.localeCompare(
          b.childNodes[idx].innerHTML,
          "en",
          { numeric: true, sensitivity: "base" }
        );
      })
      .forEach(row => {
        sortDirection
          ? tbody.insertBefore(row, tbody.childNodes[tbody.length])
          : tbody.insertBefore(row, tbody.childNodes[0]);
      });
  });
});