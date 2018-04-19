/**
 * Self-executing function to inject into the WebView
 */
export const injectedJS = `(${String(function() {
    // Injected classnames
    const INJECTED_CLASSNAME = 'SpareMeElement';
    const HIDDEN_CLASSNAME = 'SpareMeHidden';
    const REVEALED_CLASSNAME = 'SpareMeRevealed';

    // The default API category
    const DEFAULT_CATEGORY = 'harmless';

    var injectedClassCounter = 0;

    const HTTP_BATCH_SIZE = 25

    inject();

    function inject() {
        // Open two-way message channel between React and the WebView
        createMessageSender();
        document.addEventListener('message', onReactMessage);
        document.addEventListener('selectionchange', onSelection);

        // Send tags to React for processing
        analyzePage();
    }

    /**
     * Sends messages from the WebView to React
     */
    function createMessageSender() {
        // Steal back any site's postMessage overrides 😏
        var originalPostMessage = window.postMessage;
        var patchedPostMessage = function(message, targetOrigin, transfer) {
            originalPostMessage(message, targetOrigin, transfer);
        }
        patchedPostMessage.toString = function() {
            return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
        }
        window.postMessage = patchedPostMessage;
    }

    /**
     * Handles messages from React
     */
    function onReactMessage(data) {
        let action = JSON.parse(data.data);
        let name = action['name'];

        switch (name) {
            case 'hide':
                let className = action['className'];
                var element = document.getElementsByClassName(className)[0];

                // Only hide elements once :D
                if (!isHidden(element) && !isRevealed(element)) {
                    hideElement(element);
                }
                break;

            case 'hideSelectionForNewCategory':
                snapSelectionToWord();
                let sel = window.getSelection();

                window.postMessage(JSON.stringify({
                    messageType: 'textHidden',
                    text : sel.toString()
                }));

                // Hide all elements in the selection range
                var selectionRange = sel.getRangeAt(0);

                if (selectionRange.commonAncestorContainer.getElementsByClassName) {
                    // Multiple elements selected
                    var elementsInRangeParent = selectionRange.commonAncestorContainer
                        .getElementsByClassName(INJECTED_CLASSNAME);

                    console.log(elementsInRangeParent);

                    for (var i = 0, element; element = elementsInRangeParent[i]; i++) {
                        if (sel.containsNode(element, true)) {
                            hideElement(element);
                        }
                    }
                } else { /* Single element selected */
                    let selectedHTMLElement = sel.anchorNode.parentElement;

                    if (selectedHTMLElement) {
                        hideElement(selectedHTMLElement);
                    }
                }

                break;

            case 'selectionFlagged':
                snapSelectionToWord();
                let category = action['category'];
                let selection = window.getSelection();

                window.postMessage(JSON.stringify({
                    messageType: 'addTextToAPI',
                    text : window.getSelection().toString(),
                    category: category
                }));

                // Hide all elements in the selection range
                var selectionRange = selection.getRangeAt(0);

                if (selectionRange.commonAncestorContainer.getElementsByClassName) {
                    // Multiple elements selected
                    var elementsInRangeParent = selectionRange.commonAncestorContainer
                        .getElementsByClassName(INJECTED_CLASSNAME);

                    console.log(elementsInRangeParent);

                    for (var i = 0, element; element = elementsInRangeParent[i]; i++) {
                        if (selection.containsNode(element, true)) {
                            hideElement(element);
                        }
                    }
                } else { /* Single element selected */
                    let selectedHTMLElement = window.getSelection().anchorNode.parentElement;

                    if (selectedHTMLElement) {
                        hideElement(selectedHTMLElement);
                    }
                }

                break;

            case 'selectionUnflagged':
                var element = window.revealedElement;
                element.classList.remove(REVEALED_CLASSNAME);

                // Alert React that the user unflagged an element
                window.postMessage(JSON.stringify({
                    messageType: 'addTextToAPI',
                    text : String(element.tagName === 'IMG' ?
                        element.alt :
                        element.innerText),
                        category: DEFAULT_CATEGORY
                }));
                break;

            case 'unflagIgnored':
                var element = window.revealedElement;
                console.log('unflagIgnored');
                hideElement(element);

                let img = element.getElementsByTagName("IMG")[0];

                if (img != null) {
                    hideElement(img);
                }

                break;

            default:
                // Unknown message type
                break;
        }
    }

    function hideElement(element) {
        element.classList.add(HIDDEN_CLASSNAME);

        if (element.tagName === 'IMG') {
            element.oldSrc = element.src;

            // We may want to host this image ourselves to ensure it's always available
            element.src = "https://www.materialui.co/materialIcons/action/visibility_off_grey_96x96.png";
            element.style.width = "auto";
            element.style.height = 'auto';
        } else {
            element.style.color = 'transparent';
            element.style.textShadow = '0 0 20px black';
        }

        element.style.webkitUserSelect = 'none';
        element.addEventListener('click', onHiddenElementClick(element));
        configureLongPressActions(element)
    }

    function revealElement(element) {
        element.classList.remove(HIDDEN_CLASSNAME);
        element.classList.add(REVEALED_CLASSNAME);

        // Recurse for img containers
        let img = element.getElementsByTagName("IMG")[0];
        if (img != null) {
            revealElement(img);
        }

        if (element.tagName === 'IMG') {
            element.style.visibility = "hidden"; // prevent image flashing
            element.style.width = null;
            element.style.height = null;
            element.src = element.oldSrc;
            element.style.visibility = "visible" // prevent image flashing

        } else {
            element.style.color = null;
            element.style.textShadow = null;
        }

        element.style.webkitUserSelect = 'auto';
        window.revealedElement = element;
        console.log("revealed element:")
        console.log(element)
    }

    function configureLongPressActions(node) {
        var longpress = false;
        var presstimer = null;

        var cancel = function(e) {
            if (presstimer !== null) {
                clearTimeout(presstimer);
                presstimer = null;
            }
        };

        var start = function(e) {
            longpress = false;
            presstimer = setTimeout(function() {
                revealElement(node)
                longpress = true;
            }, 500);
        };

        node.addEventListener('touchstart', start);
        node.addEventListener('touchend', cancel);
        node.addEventListener('touchleave', cancel);
        node.addEventListener('touchcancel', cancel);
    }

    function onHiddenElementClick(element) {
        return function(event) {
            if (isHidden(element)) {
                /* Element must be revealed before allowing
                its normal onclick to fire */
                event.preventDefault();

                window.postMessage(JSON.stringify({
                    messageType: 'elementRevealed'
                }));

                // Reveal the element
                revealElement(element);
            }
        }
    }

    /**
     * Sends un-hidden text selections to React.
     */
    function onSelection() {
        let textSelection = window.getSelection();

        if (textSelection == '') {
            /* Delay message posting by 10ms to allow any other listeners
            to be invoked before using window.postMessage(). Bubbling/capturing
            doesn't work here due to the way window.postMessage() is implemented
            */
            window.setTimeout(() => {
                window.postMessage(JSON.stringify({
                messageType: 'selectionEnded'
                }));
            }, 10);

            return;
        }

        let selectedHTMLElement = textSelection.anchorNode.parentElement;
        var isHiddenElement = selectedHTMLElement.classList.contains(HIDDEN_CLASSNAME);

        window.postMessage(JSON.stringify({
            messageType: 'selectionChanged',
            content : window.getSelection().toString(),
            isHiddenElement: isHiddenElement
        }));
    }

    /**
    * Snaps the current selection to the nearest white space.
    *
    * Adapted from http://jsfiddle.net/3RAkZ/
    */
    function snapSelectionToWord() {
        var sel = window.getSelection();
        if (sel.isCollapsed) {
            return;
        }

        var range = document.createRange();

        // Get absolute range of selection
        range.setStart(sel.anchorNode, sel.anchorOffset);
        range.setEnd(sel.focusNode, sel.focusOffset);

        // Detect if selection is backwards
        var backwards = range.collapsed;
        range.detach();

        var endNode = sel.focusNode
        var endOffset = sel.focusOffset;
        sel.collapse(sel.anchorNode, sel.anchorOffset);

        if (backwards) {
            sel.modify("move", "backward", "character");
            sel.modify("move", "forward", "word");
            sel.extend(endNode, endOffset);
            sel.modify("extend", "forward", "character");
            sel.modify("extend", "backward", "word");

        } else {
            sel.modify("move", "forward", "character");
            sel.modify("move", "backward", "word");
            sel.extend(endNode, endOffset);
            sel.modify("extend", "backward", "character");
            sel.modify("extend", "forward", "word");
        }
    }

    function analyzePage() {
        var elements = document.body.querySelectorAll('p, a, li, h1, h2, h3, h4, span, div, font, b, img, strong');
        var predictionGroup = {};
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];

            if (element.tagName === 'SPAN' || element.tagName === 'DIV') {
                // Discard divs and spans that wrap other HTML elements
                if (element.firstChild != null && (element.firstChild.tagName === 'SPAN' || element.firstChild.tagName === 'DIV')) {
                    continue;
                }
            } else {
                console.log('Found non-empty div/span');
            }

            // Add unique class so we can find this element later
            let addedClass = INJECTED_CLASSNAME + injectedClassCounter;
            injectedClassCounter += 1;
            element.classList.add(addedClass);

            // Add non-unique class for easy grouping without regex
            element.classList.add(INJECTED_CLASSNAME)

            // Map the added class name to the element's innerText
            predictionGroup[addedClass] = String(element.tagName === 'IMG' ? element.alt : element.innerText)

            // Send elements in groups of HTTP_BATCH_SIZE to React
            if (injectedClassCounter % HTTP_BATCH_SIZE == 0 || i == elements.length - 1) {
                window.postMessage(JSON.stringify({
                    messageType: 'predict',
                    content : predictionGroup
                }));

                predictionGroup = {}
            }
        }
    }

    function isHidden(element) {
        return element.classList.contains(HIDDEN_CLASSNAME);
    }

    function isRevealed(element) {
        return element.classList.contains(REVEALED_CLASSNAME);
    }

})})();` // JavaScript :)
