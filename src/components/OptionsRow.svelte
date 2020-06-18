<script>
  import { createEventDispatcher } from "svelte";

  export let options; // List of options
  export let selectedIdx = 0; // The index of the selected option. Defaults to 0

  const dispatch = createEventDispatcher();

  function handleClick(selected) {
    selectedIdx = selected;
    dispatch("select", {
      selectedIdx
    });
  }
</script>

<style>
  div {
    display: flex;
  }

  button {
    font-family: "Quicksand", sans-serif;
    font-size: 1.5em;
    outline: none;
    background: transparent;
    border: none;
    color: #333;
  }

  button:hover {
    background-color: #333;
    color: white;
  }

  .selected {
    font-weight: bold;
  }
</style>

<div>
  {#each options as option, i}
    <button class:selected={i === selectedIdx} on:click={() => handleClick(i)}>
      {option}
    </button>
  {/each}
</div>
