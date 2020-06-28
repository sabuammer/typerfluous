<script>
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import fire from "../config/fire";
  import randomWords from "random-words";
  import OptionsRow from "./OptionsRow.svelte";
  import { currentUser } from "../stores/currentUser";

  const wordCounts = [10, 50, 100, 150, 200];
  const testCategories = ["words", "timed"];
  const testingTimes = [0.5, 1, 2, 3, 5];
  const timedTestWordCount = 1000;

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
  let selectedCountsIdx = 1; // default index into wordCounts array
  let selectedTimesIdx = 1;
  let numErrors = 0;

  let timerInterval;
  let secondsElapsed = 0;

  let typing = false; // Whether or not user has begun typing
  let disableTyping = false; // Whether or not we should prevent any more calls to handleInput
  let wordsTest = true; // Type of typing test, default to words test, false means timed test

  // Lifecycle methods
  onMount(() => {
    typingInput.focus();
  });

  // Reactive variables
  $: numWords = wordCounts[selectedCountsIdx]; // Number of words user has selected to type
  $: timeLimit = testingTimes[selectedTimesIdx] * 60; // Number of seconds alotted for timed typing test
  $: timeRemaining = new Date(1000 * timeLimit).toISOString().slice(15, -5); // String detailing the time left in timed test in human readable format
  $: words = randomWords(numWords); // The words generated for later typing
  $: totalChars = words.join("");

  async function handleWordsTest(e) {
    if (!typing) {
      timerInterval = setInterval(() => secondsElapsed++, 1000);
      typing = true;
    }

    handleInput(e);

    if (inputIndex === numWords) {
      clearInterval(timerInterval);
      secondsElapsed = 0;
      typing = false;
      disableTyping = true;

      if ($currentUser) {
        await updateUserStats();
      }
    }
  }

  async function handleTimedTest(e) {
    if (!typing) {
      timerInterval = setInterval(() => {
        timeLimit--;
        secondsElapsed++; // Increment here so that wpm calculation works for timed test as well
      }, 1000);
      typing = true;
    }

    handleInput(e);

    if (timeLimit === 0) {
      clearInterval(timerInterval);
      timeLimit = testingTimes[selectedTimesIdx] * 60;
      typing = false;
      disableTyping = true;

      if ($currentUser) {
        await updateUserStats();
      }
    }
  }

  async function updateUserStats() {
    // Save user stats only if logged in
    let typingStats = await fire
      .database()
      .ref(`users/${$currentUser.userId}/typing_stats`)
      .once("value", snapshot => snapshot);
    typingStats = typingStats.val(); // Get the value from the snapshot

    if (netWPM > typingStats.highest_wpm) {
      typingStats.highest_wpm = netWPM;
    }

    if (typingStats.test_stats) {
      typingStats.test_stats.push({ wpm: netWPM, accuracy });
    } else {
      typingStats.test_stats = [{ wpm: netWPM, accuracy }];
    }

    let wpm_sum = 0,
      avg_sum = 0;
    for (let stat of typingStats.test_stats) {
      wpm_sum += stat.wpm;
      avg_sum += stat.accuracy;
    }

    typingStats.avg_wpm = wpm_sum / typingStats.test_stats.length;
    typingStats.avg_accuracy = avg_sum / typingStats.test_stats.length;

    await fire
      .database()
      .ref(`users/${$currentUser.userId}/typing_stats`)
      .set(typingStats);
  }

  function handleInput(e) {
    if (e.key === " ") {
      let currInput = currTyped ? currTyped.trim() : ""; // This makes sure that something is actually typed into the input
      if (currInput === words[inputIndex]) {
        classes.push("correct");
      } else {
        numErrors += words[inputIndex].length;
        classes.push("incorrect");
      }

      charsTyped += words[inputIndex];

      if (secondsElapsed > 0 && charsTyped.length > 0) {
        // This check is to make sure accuracy doesn't perform a division by 0
        accuracy = ((charsTyped.length - numErrors) / charsTyped.length) * 100;
        netWPM = (charsTyped.length - numErrors) / 5 / (secondsElapsed / 60);
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
  }

  function handleTimeLimitChange(e) {
    selectedTimesIdx = e.detail.selectedIdx;
    numWords = timedTestWordCount;
    handleRestart();
  }

  function handleWordCountChange(e) {
    selectedCountsIdx = e.detail.selectedIdx;
    handleRestart();
  }

  function handleTestCategoryChange(e) {
    wordsTest = e.detail.selectedIdx === 0;
    numWords = wordsTest ? wordCounts[selectedCountsIdx] : timedTestWordCount;
    handleRestart();
  }

  function handleRestart() {
    inputIndex = 0;
    numErrors = 0;
    currTyped = "";
    charsTyped = "";
    classes = [];
    words = randomWords(numWords);
    timeLimit = testingTimes[selectedTimesIdx] * 60;
    accuracy = 0;
    netWPM = 0;
    secondsElapsed = 0;
    typing = false;
    disableTyping = false;
    clearInterval(timerInterval);
    paragraphText.scrollTo(0, 0);
    numScroll = 0;
    typingInput.focus();
  }

  function handleKeydown(e) {
    // Add special key shortcuts here
    switch (e.key) {
      case "Escape":
      case "Esc":
        handleRestart();
        break;
      default:
        if (!disableTyping) {
          if (wordsTest) {
            handleWordsTest(e);
          } else {
            handleTimedTest(e);
          }
        }
    }
  }
</script>

<style>
  p,
  input {
    font-size: 1.5em;
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

  p::-webkit-scrollbar {
    background-color: transparent;
  }

  p::-webkit-scrollbar-thumb {
    background-color: #333;
    border-radius: 10px;
  }

  button {
    font-size: 1.5em;
    border: none;
    background-color: unset;
    margin-top: 15px;
    cursor: pointer;
  }

  button:hover {
    background-color: #333;
    color: white;
  }

  span {
    margin-right: 0.3em;
  }

  input {
    border: none transparent;
    outline: none;
    background: #9aa2ad;
    border-radius: 3px;
    padding-left: 10px;
  }

  .selected {
    background: #333;
    color: white;
  }

  .incorrect {
    color: red;
  }

  .correct {
    color: green;
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
    border-bottom-left-radius: 7px;
    border-bottom-right-radius: 7px;
  }

  .input-line {
    display: grid;
    grid-template-rows: 2.5em;
    grid-template-columns: 5fr 1fr;
    margin-top: 20px;
  }

  .options-and-info-row {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
  }

  .options-label {
    background: #333;
    color: white;
    padding: 3px;
    font-size: 1.5em;
    margin: 0;
    min-width: 4.75em;
    display: block;
    text-align: center;
  }

  .test-container {
    margin-top: 25px;
  }

  strong {
    margin-right: 10px;
  }

  .typing-stats {
    display: flex;
  }
</style>

<div in:fade class="test-container">
  <div class="options-and-info-row">
    {#if wordsTest}
      <OptionsRow
        selectedIdx={selectedCountsIdx}
        options={wordCounts}
        on:select={handleWordCountChange} />
    {:else}
      <OptionsRow
        selectedIdx={selectedTimesIdx}
        options={testingTimes}
        on:select={handleTimeLimitChange} />
    {/if}
    <OptionsRow options={testCategories} on:select={handleTestCategoryChange} />
    <div class="typing-stats">
      <span class="options-label">
        <strong>wpm:</strong>
        {Math.round(netWPM)}
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
        on:keydown={handleKeydown} />
      <button class="restart-btn" on:click={handleRestart}>
        {#if wordsTest}restart{:else}{timeRemaining}{/if}
      </button>
    </div>
  </div>
</div>
