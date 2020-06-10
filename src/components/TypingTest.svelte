<script>
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import randomWords from "random-words";

  const wordCounts = [10, 50, 100, 150, 200];

  // DOM bindings
  let typingInput; // Reference to input that user types in
  let paragraphText; // Reference to the paragraph element surrounding all the spans with text
  let currTyped; // The currently typed string in the text input

  let accuracy = 0;
  let netWPM = 0;
  let numScroll = 0; // Number of times we have automatically scrolled the text down. For use in autoscroll functionality

  let classes = []; // The class for each individual word in the paragraph (selected or not, correct or not)
  let charsTyped = ""; // All correct characters typed by the user so far
  let inputIndex = 0; // Index into the words array. Starts at zero before user begins typing
  let selectedIdx = 1; // default index into wordCounts array

  let timerInterval;
  let secondsElapsed = 0;

  let notTyping = true; // Whether or not user has begun typing

  // Lifecycle methods
  onMount(() => {
    typingInput.focus();
  });

  // Reactive variables
  $: words = randomWords(numWords); // The words generated for later typing
  $: avgWordLen =
    words
      .map(word => word.length)
      .reduce((accum, currLength) => accum + currLength) / words.length; // For use in calculating average word length for wpm calc
  $: totalChars = words.join("");
  $: numWords = wordCounts[selectedIdx]; // Number of words user has selected to type

  function handleInput(e) {
    if (notTyping) {
      timerInterval = setInterval(() => secondsElapsed++, 1000);
      notTyping = false;
    }
    if (e.data === " ") {
      if (currTyped.trim() === words[inputIndex]) {
        charsTyped += currTyped.trim();
        classes.push("correct");
      } else {
        classes.push("incorrect");
      }
      if (secondsElapsed > 0) {
        accuracy = (charsTyped.length / totalChars.length) * 100;
        netWPM = charsTyped.length / avgWordLen / (secondsElapsed / 60);
      }
      currTyped = "";
			inputIndex++;
			
      if (inputIndex < numWords) {
        let nextWord = paragraphText.childNodes[inputIndex];
        let scrollingOffset = nextWord.offsetTop - paragraphText.offsetTop;
        if (
          scrollingOffset +
            nextWord.offsetHeight -
            numScroll * paragraphText.offsetHeight >
          paragraphText.offsetHeight
        ) {
          paragraphText.scroll({
            top: scrollingOffset,
            left: 0,
            behavior: "smooth"
          });
          numScroll++;
        }
      }
		}
		
    if (inputIndex === numWords) {
      clearInterval(timerInterval);
      secondsElapsed = 0;
      notTyping = true;
      typingInput.disabled = true;
    }
  }

  function handleWordCountChange(newNumWords) {
    numWords = newNumWords;
    selectedIdx = wordCounts.indexOf(newNumWords);
		handleRestart();
  }

  function handleRestart() {
    inputIndex = 0;
    currTyped = "";
    charsTyped = "";
    classes = [];
    words = randomWords(numWords);
    accuracy = 0;
    netWPM = 0;
    secondsElapsed = 0;
    notTyping = true;
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    typingInput.disabled = false;
    paragraphText.scrollTo(0, 0);
    numScroll = 0;
    typingInput.focus();
  }

  function handleKeydown(e) {
    // Add special key shortcuts here
    if (e.key === "Escape" || e.key === "Esc") {
      handleRestart();
    }
  }
</script>

<style>
  p,
  span,
  input {
    font-family: "Quicksand", sans-serif;
    font-size: 1.25em;
  }

  p {
    display: flex;
    flex-wrap: wrap;
    max-height: 350px;
    overflow-y: auto;
    margin-top: 0px;
    margin-bottom: 0px;
    scrollbar-color: #333 transparent;
  }

  span {
    margin-right: 0.3em;
  }

  button {
    font-family: "Quicksand", sans-serif;
    font-size: 1.5em;
    border: none;
    background-color: unset;
    margin-top: 15px;
  }

  button:hover {
    background-color: #333;
    color: white;
  }

  .selected-counts {
    font-weight: bold;
  }

  .word-counts-span {
    font-family: "Quicksand", sans-serif;
    margin-right: 10px;
    font-size: 1.6em;
  }

  input {
    border: none transparent;
    outline: none;
    background: #9aa2ad;
    border-radius: 3px;
    padding-left: 10px;
  }

  .selected {
    background-color: #333;
    color: white;
  }

  .correct {
    color: green;
  }

  .incorrect {
    color: red;
  }

  .restart-btn {
    background: #5a5d63;
    color: white;
    margin-top: 0px;
    margin-left: 10px;
    border-radius: 3px;
  }

  .typing-test {
    background: #c8d2e0;
    padding: 25px;
    margin-top: 15px;
    border-radius: 7px;
  }

  .input-line {
    display: grid;
    grid-template-rows: 2.5em;
    grid-template-columns: 5fr 1fr;
    margin-top: 20px;
  }

  .options-row {
    display: flex;
    margin-top: 15px;
  }

  .options-label {
    font-family: "Quicksand", sans-serif;
    font-size: 1.6em;
  }

  .result-labels {
    margin-left: auto;
  }
</style>

<div transition:fade={{ delay: 250 }}>
  <div class="options-row">
    {#each wordCounts as wordCount, i}
      <span
        class={i === selectedIdx ? ['selected-counts', 'word-counts-span'].join(' ') : 'word-counts-span'}
        on:click={() => handleWordCountChange(wordCount)}>
        {wordCount}
      </span>
    {/each}
    <div class="result-labels">
      <span class="options-label">
        <strong>net wpm:</strong>
        {Math.round(netWPM)} |
      </span>
      <span class="options-label">
        <strong>acc:</strong>
        {Math.round(accuracy)}
      </span>
    </div>
  </div>
  <div class="typing-test">
    <p bind:this={paragraphText}>
      {#each words as word, i}
        <span
          class={i === inputIndex ? [classes[i], 'selected'].join(' ') : classes[i]}>
          {word}
        </span>
      {/each}
    </p>
    <div class="input-line">
      <input
        type="text"
        bind:this={typingInput}
        bind:value={currTyped}
        on:input={handleInput}
        on:keydown={handleKeydown} />
      <button class="restart-btn" on:click={() => handleRestart()}>
        restart
      </button>
    </div>
  </div>
</div>
