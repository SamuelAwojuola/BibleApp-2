let arrowKeyPreventDefault = true, t_arrow, _raf_verseToVese;
let allVmltpl = document.getElementsByClassName('vmultiple');
// Variables to track the last key press
let lastKeyPressTime = 0;
let lastKeyCode = null;
let lastArrowKeyPressTime = 0;
let lastArrowKeyCode = null;
let t_lstArrowPress;
let scrollTimeout = null;
let DOUBLE_PRESS_THRESHOLD = 200; // Time in ms to detect double press
let DEBOUNCE_DELAY = 100; // Time in ms to wait before allowing scroll
let oldMainScrollTop;
let stopScrolling;
document.activeClickedElement = document.body;
// (function() {
    /* ensure input element not selected
        Press Numpad 3 (or Ctrl + Space) :: scroll the page slowly
        Press Numpad 3 again to stop scrolling
        Press Numpad 9 :: scroll the page slowly in the opposite direction
        Press Numpad 9 again to stop scrolling in the opposite direction
        Press Space :: to stop scrolling in any direction
        To increase speed of scrolling in any direction, multiple press (like double/triple/etc click) the same Numpad 3 or 9 key             
    */
    
    // Constants and variables
    const elementToScroll = document.getElementById('main');
    let baseSpeed = 47.5; // Base scrolling speed in pixels per second
    let currentDirection = 'none'; // 'up', 'down', or 'none'
    let speedLevel = 0; // Current speed multiplier
    let speed = 0; // Current speed in pixels per second
    let canIncreaseSpeed = false; // Flag for speed increase window
    let timerId = null; // Timeout ID for speed increase
    let rafId = null; // Request animation frame ID
    let lastTime = null; // Last timestamp for frame timing
    let mDownElm;
    let i_t;
    let acceleration = 0;
    
    // Scroll animation function
    function scrollStep(timestamp) {
        clearInterval(i_t);
        
        if (speed === 0) {
            acceleration = 0;
            rafId = null;
            return;
        }
        const pauseActElmMatch = 'input, #refnav_col2, #refnav_col2 *';//#bottomleft_btns .nextprevchpt,
        const pauseScrolling = document.activeElement.matches(pauseActElmMatch);
        if (lastTime === null || pauseScrolling || (mDownElm && mDownElm.matches('button'))) {lastTime = timestamp;}
        
        const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;

        const targetSpeed = (currentDirection === 'up' ? -1 : 1) * baseSpeed * speedLevel;
        acceleration += (targetSpeed - speed) * deltaTime * 2;
        speed += acceleration;
        const scrollAmount = speed * deltaTime;
        elementToScroll.scrollBy({ top: scrollAmount, behavior: 'auto' });
        if (scrollAmount==0 && pauseScrolling) {
            const old_speedLevel = speedLevel;
            const old_speed = speed;
            const old_direction = currentDirection;
            //Pause scrolling
            i_t = setInterval(() => {
                speedLevel--;
                rafId = requestAnimationFrame(scrollStep);
                if (speedLevel < 1) {
                    lastTime = null;
                    rafId = requestAnimationFrame(scrollStep);
                    speedLevel = old_speedLevel;
                }
            }, 1000);
        }
        else {
            clearInterval(i_t);
            rafId = requestAnimationFrame(scrollStep);
        }
    }
    
    // Stop scrolling function
    stopScrolling = function() {
        let amplitude = speedLevel;  // Initial amplitude based on current speed
        let time = 0;
        const damping = 0.85;       // Controls how quickly the bounce fades
        const frequency = 1;     // Controls the speed of oscillations
        let bounce;

        const bounceStop = () => {
            time += 0.1;
            // Spring equation with damping
            bounce = amplitude * Math.exp(-time * damping) * Math.cos(frequency * time);
            speedLevel = Math.abs(bounce);
            rafId = requestAnimationFrame(scrollStep);
            if (speedLevel < 0.1) {
                speed = 0;
                currentDirection = 'none';
                speedLevel = 0;
                canIncreaseSpeed = false;
                clearTimeout(timerId);
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            } else{
                rafId = requestAnimationFrame(bounceStop);
            }
        }
        requestAnimationFrame(bounceStop)
    }
    
    // Set timer for speed increase window
    function setIncreaseSpeedTimer() {
        canIncreaseSpeed = true;
        clearTimeout(timerId);
        timerId = setTimeout(() => {canIncreaseSpeed = false;}, 300); // 300ms window for multi-press
    }
    
    // Handle key press logic
    function handleKeyPress(direction) {
        if (currentDirection === direction) {
            if (canIncreaseSpeed) {
                speedLevel++;
                speed = (direction === 'down' ? 1 : -1) * baseSpeed * speedLevel;
                setIncreaseSpeedTimer();
            }
            else {stopScrolling();}
        } else {
            currentDirection = direction;
            speedLevel = 1;
            speed = (direction === 'down' ? 1 : -1) * baseSpeed * speedLevel;
            if (rafId === null) {
                lastTime = null;
                rafId = requestAnimationFrame(scrollStep);
            }
            setIncreaseSpeedTimer();
        }
    }
    
    // Keydown event handler
    function keyDownHandler(e) {
        const docActElm = document.activeClickedElement;

        if(mouseOverCMenu || e.shiftKey || !['ArrowUp','ArrowDown','Numpad3','Numpad9','Space','Control'].includes(e.code) || ((e.code==='ArrowUp' || e.code==='ArrowDown') && (e.ctrlKey||e.shiftKey||e.altKey)) || docActElm.matches('input, [contenteditable="true"], #app_settings *, #refnav_col2 *') || document.activeElement.matches('input, [contenteditable="true"],#app_settings *, #refnav_col2 *') || (docActElm.matches('.verse_note, .verse_note *') && docActElm.closest('.verse_note').style['display']!='none')){return}
        
        let arrowDblClicked = false;
        const currentTime = Date.now();
        const isArrowKey = e.code === 'ArrowUp' || e.code === 'ArrowDown';
        const timeDiff = currentTime - lastKeyPressTime;
        if(isArrowKey){
            if(arrowKeyPreventDefault){e.preventDefault();}
            else{return}
        }
        //first arrow press
        if(isArrowKey && !lastArrowKeyCode){
            oldMScrollTop = elementToScroll.scrollTop;//ensure it starts smooth scrolling from the point of first arrow press
            lastArrowKeyCode = e.code;
            lastArrowKeyPressTime = currentTime;
            t_lstArrowPress = setTimeout(() => {
                lastArrowKeyCode = null;
                lastArrowKeyPressTime = 0;
                clearTimeout(t_lstArrowPress);
            }, 300);
            return
        }
        else if (isArrowKey && lastArrowKeyCode === e.code && timeDiff < DOUBLE_PRESS_THRESHOLD) {
            // Double press detected, clear timeout and return
            arrowDblClicked = true;
            
            //ensure it starts smooth scrolling from the point of first arrow press
            clearTimeout(t_lstArrowPress);
            cancelAnimationFrame(_raf_verseToVese);
            // elementToScroll.scrollTo({left:0, top:oldMScrollTop, behavior:'smooth'});
            
            //reset lastArrowKeyCode
            t_lstArrowPress = setTimeout(() => {
                lastArrowKeyCode = null;
                lastArrowKeyPressTime = 0;
                clearTimeout(t_lstArrowPress);
            }, 300);
        }

        // Spacebar
        if (!e.ctrlKey && e.code === 'Space') {
            e.preventDefault();
            stopScrolling();
        }
        // Numpad +
        else if ((e.code === 'Numpad9')||(e.code === 'ArrowUp' && lastArrowKeyCode == e.code)) {
            e.preventDefault();
            if (rafId) {cancelAnimationFrame(rafId);rafId = null;}
            handleKeyPress('up');
        }
        // Numpad - OR Ctrl + Spacebar
        else if ((e.code === 'Numpad3')||(e.code === 'ArrowDown' && lastArrowKeyCode == e.code)||(e.ctrlKey && e.code === 'Space')) {
            e.preventDefault();
            if (rafId) {cancelAnimationFrame(rafId);rafId = null;}
            handleKeyPress('down');
        }
    }
    let mDt;
    function mDown(ev){
        document.addEventListener('mouseup', mUp);
        clearTimeout(mDt);
        mDownElm = ev.target;
        function mUp(){
            document.removeEventListener('mouseup', mUp);
            mDt = setTimeout(() => {mDownElm = null;}, 4000);
        }
    }
    // Expose baseSpeed for testing (e.g., via console)
    window.setBaseSpeed = function(newSpeed) {
        baseSpeed = newSpeed;
        console.log(`Base speed set to: ${baseSpeed}`);
        // If scrolling, update current speed
        if (speed !== 0) {
            speed = (currentDirection === 'up' ? -1 : 1) * baseSpeed * speedLevel;
            console.log(`Updated current speed to: ${speed}`);
        }
    };
    // Attach event listener
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('mousedown', mDown);
    // StopScrolling When Any Button is Pressed (the animation is very demanding and blocks some functions)
    document.addEventListener('keydown',buttonPressedDown);
    document.addEventListener('mousedown',buttonPressedDown);
    function buttonPressedDown(e){
        if((e.type=='keydown' && ['Enter','NumpadEnter'].includes(e.code))||(e.type=='mousedown') && (e.target.matches('button') || e.target.closest('button'))){
            stopScrolling();
        }
    }
// })();
async function smoothScrollFromVerseToVerse(e){
    /* On key press, scmoothly scroll to next or previous verse  */
    // ensure input element not selected

    const docActElm = document.activeClickedElement;
    
    if(mouseOverCMenu || e.shiftKey || !['ArrowUp','ArrowDown','NumpadAdd','NumpadSubtract','Numpad2','Numpad8'].includes(e.code) || ((e.code==='ArrowUp' || e.code==='ArrowDown') && (e.ctrlKey||e.shiftKey||e.altKey)) || docActElm.matches('input, [contenteditable="true"], #app_settings *, #refnav_col2 *') || document.activeElement.matches('input, [contenteditable="true"], #app_settings *, #refnav_col2 *') || (docActElm.matches('.verse_note, .verse_note *') && docActElm.closest('.verse_note').style['display']!='none')){return}

    if(e.code==='ArrowUp' || e.code==='ArrowDown'){
        if(arrowKeyPreventDefault){e.preventDefault();}
        else{return}
    }
    // Double press detection for 'ArrowUp' or 'ArrowDown'
    const t = 500;
    const currentTime = Date.now();
    const isArrowKey = e.code === 'ArrowUp' || e.code === 'ArrowDown';

    // For non-arrow keys, proceed immediately
    if (!isArrowKey) {
        // VERSE IN THE MIDDLE INSTEAD
        centerVERSEthatIsBeingRead();
        return
    }
    // Double press detection for ArrowUp or ArrowDown
    const timeDiff = currentTime - lastKeyPressTime;
    if (isArrowKey && lastKeyCode === e.code && timeDiff < DOUBLE_PRESS_THRESHOLD) {
        // Double press detected, clear timeout and return
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
        return;
    }

    // Clear any existing timeout
    if (scrollTimeout) {clearTimeout(scrollTimeout);}

    // Update last key press info
    lastKeyPressTime = currentTime;
    lastKeyCode = e.code;

    // Set a new timeout to run the scrolling logic after a delay
    scrollTimeout = setTimeout(async () => {
        // Only proceed if this is the latest timeout (not cleared by a subsequent press)
        if (Date.now() - lastKeyPressTime >= DEBOUNCE_DELAY) {centerVERSEthatIsBeingRead();}
        scrollTimeout = null;
    }, DEBOUNCE_DELAY);

    async function centerVERSEthatIsBeingRead() {
        const vMultipleInCenterOfMain = getMiddleOrClosestElement(main,'.vmultiple, .vmultiple *').closest('.vmultiple');
        const targVMultiple = vMultipleInCenterOfMain;
        let hvIndx = targVMultiple ? Array.from(allVmltpl).indexOf(targVMultiple) : null;
        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            if(arrowKeyPreventDefault){e.preventDefault();}
            else{return}
        }
        // previous verse
        if (e.code==='NumpadSubtract'|| e.code==='ArrowUp' || e.code==='Numpad8'){
            // ['NumpadSubtract','ArrowUp','Numpad8'].includes(e.code)
            if(isTopVisible(targVMultiple)){
                const pv = allVmltpl[hvIndx-1];
                pv ? (await smoothScrollTo(pv, 'auto', t)):null;
            } else {
                smoothScrollTo(targVMultiple, 'start', t);
            }
        }
        // next verse
        else if (e.code==='NumpadAdd' || e.code==='ArrowDown' || e.code==='Numpad2'){
            // ['NumpadAdd','ArrowDown','Numpad2'].includes(e.code)
            // if the whole verse is not visible, show the lower part of the verse
            if(isBottomVisible(targVMultiple)){
                const nv = allVmltpl[hvIndx+1];
                nv ? (await smoothScrollTo(nv, 'auto', t)):null;
            } else {
                smoothScrollTo(targVMultiple, 'end', t);
            }
        }
    }
    // VERSE AT THE TOP
    function isTopVisible(element) {
        const rect = element.getBoundingClientRect();
        // return rect.top >= 0;
        return rect.top >= main.getBoundingClientRect().top;
    }
    function isBottomVisible(element) {
        const rect = element.getBoundingClientRect();
        // return (rect.bottom - 20) <= window.innerHeight;
        return (rect.bottom - 20) <= (main.getBoundingClientRect().bottom);
    }
    function getMiddleOrClosestElement(targetElement, selector) {
        if (!targetElement) return null;
    
        if(!selector){
            return getMiddleElement(targetElement);
            function getMiddleElement(targetElement) {
                if (!targetElement) return null;
                const rect = targetElement.getBoundingClientRect();
                const middleX = rect.left + rect.width / 2;
                const middleY = rect.top + rect.height / 2;
                const middleElement = document.elementFromPoint(middleX, middleY);
                // return { middleX, middleY, middleElement };
                return middleElement;
            }
        }
        else {
            // Get the middle point of the target element
            const rect = targetElement.getBoundingClientRect();
            const middleX = rect.left + rect.width / 2;
            const middleY = rect.top + rect.height / 2;
        
            // Get all elements matching the selector
            const elements = document.querySelectorAll(selector);
            if (!elements.length) return null;
        
            let closestElement = null;
            let closestDistance = Infinity;
        
            elements.forEach(element => {
                const elRect = element.getBoundingClientRect();
                const elMiddleX = elRect.left + elRect.width / 2;
                const elMiddleY = elRect.top + elRect.height / 2;
        
                // Calculate distance from the target's center
                const distance = Math.hypot(middleX - elMiddleX, middleY - elMiddleY);
        
                // Select the closest element
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestElement = element;
                }
            });
        
            return closestElement;
        }
    }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
    if (!arrowKeyPreventDefault) {return;}
    // to prevent default page scrolling behavior of up/down arrow keys to allow for smooth scrolling functions

    clearTimeout(t_arrow);
    // to allow up/down arrow keys to scroll page normally when it is pressed down for a long time
    t_arrow = setTimeout(() => {arrowKeyPreventDefault = false;}, 250);
  }
});

document.addEventListener('keyup', function(ev) {
    if (ev.code === 'ArrowUp' || ev.code === 'ArrowDown') {
        clearTimeout(t_arrow);
        arrowKeyPreventDefault = true;
    }
});
async function smoothScrollTo(element, block = "auto", duration = 500) {
    const parent = document.querySelector('#main');
    if (!parent) {
        throw new Error('Scrolling parent #main not found');
    }

    const elementRect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    const elementTopInParentContent = (elementRect.top - parentRect.top) + parent.scrollTop;
    const startPosition = parent.scrollTop;
    let targetPosition;

    if (block === "auto") {
        // if it can fit in vertical center
        if(elementRect.height < parentRect.height){block = "center"}
        else {block = "start"}
    }
    if (block === "start") {
        targetPosition = elementTopInParentContent;
    }
    else if (block === "center") {
        targetPosition = elementTopInParentContent - (parent.clientHeight / 2) + (elementRect.height / 2);
    }
    else if (block === "end") {
        targetPosition = elementTopInParentContent + elementRect.height - parent.clientHeight;
    }
    else {
        throw new Error('Invalid block option. Use "start", "center", or "end".');
    }

    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = progress < 0.5 ? 2 * progress ** 2 : 1 - Math.pow(-2 * progress + 2, 2) / 2; // Ease-in-out
        parent.scrollTop = startPosition + distance * ease;

        if (timeElapsed < duration) {
            _raf_verseToVese = requestAnimationFrame(animation);
        }
    }
    _raf_verseToVese = requestAnimationFrame(animation);
    return true
}
document.addEventListener('keydown', (event) => {if(event.code=='Tab'){document.activeClickedElement = document.activeElement;}});
document.addEventListener('keyup', (event) => {if(event.code=='Tab'){document.activeClickedElement = document.activeElement;}});
document.addEventListener('mousedown', (event) => {document.activeClickedElement = event.target;});

//FOR PANNING DIAGRAM WITH MOUSEDOWN AND MOVING (BY DRAGGING ON IT)
document.addEventListener('mousedown',pan_scrollSVGandOthersByDragging);
function pan_scrollSVGandOthersByDragging(e) {
    // Prevent dragging while Ctrl key is being pressed
    // Enable dragging/panning of #main only if Alt key is pressed
    
    const mbtn = [0,2]; //allowed mousebuttons: 0-leftclick, 1-middleclick, 2-rightclick
    //Do not drag/pan if any of the following conditions is met
    if(!mbtn.includes(e.button)||e.target.matches('input,[contenteditable="true"],#context_menu *,.notes_ref_head')) {return}

    const altKeyPressed = e.altKey||e.button==2 ? true : false;// For Panning #main
    if(altKeyPressed){
        document.addEventListener('keydown',disableAltKey);
        document.addEventListener('keyup',disableAltKey);
    }
    // Check if the clicked element is scrollable content
    // const elmToDisablePanning = ['#context_menu .cmtitlebar','#context_menu .bottombar']
    const pannableElements = `:is(.text_content *):has(svg) ${altKeyPressed?',.strngsdefinition,.text_content,#main,#searchPreviewFixed,.compare_verses,.none_mainsection_note,.crossrefs,.crossrefs_holder,#context_menu :is(.verse,.strngsdefinition)':''}`;
    const scrollableContent = e.target.closest(pannableElements);
    let isScrolling = true;
    let isTextHighlighting = false; // Variable to track text highlighting
    
    if (!scrollableContent||scrollableContent.getAttribute('contenteditable')=='true') {removeEventListeners();return;};
    scrollableContent.classList.add('dragging');
    const startX = e.pageX - scrollableContent.offsetLeft;
    const startY = e.pageY - scrollableContent.offsetTop;
    const scrollLeft = scrollableContent.scrollLeft;
    const scrollTop = scrollableContent.scrollTop;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseUp);
    document.addEventListener('mouseup', onMouseUp);

    // Event listener to track text highlighting
    document.removeEventListener('selectionchange', makeHighlightingTextImpossible);
    document.addEventListener('selectionchange', makeHighlightingTextImpossible);
    function makeHighlightingTextImpossible(e) {
        const selection = window.getSelection();
        isTextHighlighting = selection.toString().length > 0;
    }
    function onMouseMove(e) {
        if (!isScrolling || e.ctrlKey || isTextHighlighting) return; // Check if Ctrl key is pressed or text highlighting is in progress
        e.preventDefault();
        const x = e.pageX - scrollableContent.offsetLeft;
        const y = e.pageY - scrollableContent.offsetTop;
        const walkX = (x - startX) * 1; // Adjust scrolling speed here
        const walkY = (y - startY) * 1; // Adjust scrolling speed here
        scrollableContent.scrollLeft = scrollLeft - walkX;
        scrollableContent.scrollTop = scrollTop - walkY;
    }
    function onMouseUp(e) {
        if (!mbtn.includes(e.button)) {return} //ensure it is only draggable with selected mouse button
        removeEventListeners()
    }
    function removeEventListeners(){
        isScrolling = false;
        scrollableContent?scrollableContent.classList.remove('dragging'):null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseleave', onMouseUp);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('selectionchange', makeHighlightingTextImpossible);
    }
    function disableAltKey(evt) {
        if(evt.key == 'Alt'){
            if(evt.type=='keydown'){evt.preventDefault();}
            else if(evt.type=='keyup'){
                document.removeEventListener('keydown', disableAltKey);
                document.removeEventListener('keyup', disableAltKey);
            }
        }
    }
}