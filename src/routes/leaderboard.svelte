<script context="module">
  export async function preload(page, session) {
    let leaderboardLabel = "words";
    let leaderboardSublabel = "10";

    let leaderboardData = await fire
      .database()
      .ref(`leaderboard/${leaderboardLabel}/${leaderboardSublabel}`)
      .once("value", snapshot => snapshot);
    leaderboardData = leaderboardData.val();

    return { leaderboardData };
  }
</script>

<script>
  import { fade } from "svelte/transition";
  import fire from "../config/fire";
  import OptionsRow from "../components/OptionsRow.svelte";

  const leaderboardWordsCategories = [10, 50, 100, 150, 200];
  const leaderboardTimedCategories = [0.5, 1, 2, 3, 5];
  const leaderboardOptions = ["words", "timed"];

  let wordsLeaderboard = true; // Which leaderboard to show, defaults to words leaderboard, false is timed
  let selectedCountsIdx = 0; // default index into leaderboardWordsCategories array
  let selectedTimesIdx = 0; // default index into leaderboardTimedCategories array

  export let leaderboardData;

  async function handleLeaderboardOptionsChange(e) {
    wordsLeaderboard = e.detail.selectedIdx === 0;
    handleCategoryChange();
  }

  async function handleCategoryChange(e) {
    let selectedIdx = e ? e.detail.selectedIdx : 0;

    let leaderboardLabel = wordsLeaderboard ? "words" : "timed";
    let leaderboardSublabel = wordsLeaderboard
      ? leaderboardWordsCategories[selectedIdx].toString()
      : leaderboardTimedCategories[selectedIdx].toString();

    if (leaderboardSublabel === "0.5") {
      leaderboardSublabel = "30 secs"; // This is done because decimals can't be in the path name
    }

    leaderboardData = await fire
      .database()
      .ref(`leaderboard/${leaderboardLabel}/${leaderboardSublabel}`)
      .once("value", snapshot => snapshot);
    leaderboardData = leaderboardData.val();
  }
</script>

<style>
  .leaderboard {
    margin-top: 25px;
  }

  .categories {
    display: flex;
    justify-content: space-between;
  }

  table {
    border-collapse: collapse;
    font-size: 1.2em;
  }

  table,
  thead,
  tbody,
  tr {
    width: 100%;
  }

  th,
  td {
    text-align: left;
    padding: 10px;
  }
  tr:nth-child(even) {
    background: #9aa2ad;
  }

  tr:nth-child(odd) {
    background: #c8d2e0;
  }

  #header-row {
    background: #333;
    color: white;
  }

  img {
    height: 1.5em;
    width: 1.5em;
    border-radius: 50%;
    margin-right: 10px;
  }

  a {
    text-decoration: none;
    display: flex;
    align-items: center;
  }
</style>

<div in:fade class="leaderboard">
  <div class="categories">
    {#if wordsLeaderboard}
      <OptionsRow
        selectedIdx={selectedCountsIdx}
        options={leaderboardWordsCategories}
        on:select={handleCategoryChange} />
    {:else}
      <OptionsRow
        selectedIdx={selectedTimesIdx}
        options={leaderboardTimedCategories}
        on:select={handleCategoryChange} />
    {/if}
    <OptionsRow
      options={leaderboardOptions}
      on:select={handleLeaderboardOptionsChange} />
  </div>
  <table>
    <thead>
      <tr id="header-row">
        <th>#</th>
        <th>Username</th>
        <th>WPM</th>
        <th>Accuracy</th>
      </tr>
    </thead>
    <tbody>
      {#if leaderboardData}
        {#each { length: leaderboardData.length > 10 ? 10 : leaderboardData.length } as _, i}
          <tr>
            <td>{i + 1}</td>
            <td>
              <a href={`profile/${leaderboardData[i].username}`}>
                <img
                  src={leaderboardData[i].photoURL}
                  alt="The user's profile picture" />
                {leaderboardData[i].username}
              </a>
            </td>
            <td>{Math.round(leaderboardData[i].wpm)}</td>
            <td>{Math.round(leaderboardData[i].accuracy)}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>

</div>
