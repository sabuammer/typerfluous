<script>
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import randomWords from "random-words";

  const wordCounts = [50, 100, 150];

  let typingInput;
  let accuracy = 0;
  let wpm;
  let currTyped; // The currently typed string in the text input

  let classes = [];
  let charsTyped = "";
  let numWords = 50; // Default number of words to type
  let inputIndex = 0;
  let selectedCount = 0; // default index into wordCounts array, numWords of 50

  onMount(() => {
    typingInput.focus();
  });

  $: words = randomWords(numWords);
  $: totalChars = words.join("");

  function handleInput(e) {
    if (e.data === " ") {
      if (currTyped.trim() === words[inputIndex]) {
        charsTyped += currTyped.trim();
        classes.push("correct");
      } else {
        classes.push("incorrect");
      }
      currTyped = "";
      inputIndex++;
    }
    if (inputIndex === numWords) {
      accuracy = (charsTyped.length / totalChars.length) * 100;
    }
  }

  function handleWordCountChange(newNumWords) {
    numWords = newNumWords;
    selectedCount = wordCounts.indexOf(newNumWords);
    inputIndex = 0;
		currTyped = "";
    charsTyped = "";
    classes = [];
    accuracy = 0;
    typingInput.focus();
  }

  function handleRestart() {
    inputIndex = 0;
    currTyped = "";
    charsTyped = "";
    classes = [];
    words = randomWords(numWords);
    accuracy = 0;
    typingInput.focus();
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
    border-bottom: 3px solid #333;
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
    padding-left: 3px;
    padding-right: 3px;
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
  }

  .accuracy-label {
    margin-left: auto;
    font-family: "Quicksand", sans-serif;
    font-size: 1.6em;
  }
</style>

<div transition:fade={{ delay: 250 }}>
  <div class="options-row">
    {#each wordCounts as wordCount, i}
      <span
        class={i === selectedCount ? ['selected-counts', 'word-counts-span'].join(' ') : 'word-counts-span'}
        on:click={() => handleWordCountChange(wordCount)}>
        {wordCount}
      </span>
    {/each}
    <span class="accuracy-label">accuracy: {Math.round(accuracy)}</span>
  </div>
  <div class="typing-test">
    <p>
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
        on:input={handleInput} />
      <button class="restart-btn" on:click={() => handleRestart()}>
        restart
      </button>
    </div>
  </div>
</div>
