<script context="module">
  export async function preload(page, session) {
    const { username } = page.params;

    let userId = await fire
      .database()
      .ref(`usernames/${username}`)
      .once("value", snapshot => snapshot);
    userId = userId.val();

    let userProfile = await fire
      .database()
      .ref(`users/${userId}`)
      .once("value", snapshot => snapshot);
    userProfile = userProfile.val();

    return { userProfile };
  }
</script>

<script>
  import { fade } from "svelte/transition";
  import fire from "../../config/fire";
  import { currentUser } from "../../stores/currentUser";
  import { onMount } from "svelte";

  export let userProfile;

  let lastFiveTests = userProfile.typing_stats.test_stats
    ? userProfile.typing_stats.test_stats.reverse().slice(0, 5)
    : [];
</script>

<style>
  img {
    height: 50vh;
  }
  .profile {
    margin-top: 30px;
    display: flex;
  }

  .profile-pic {
    flex: 1;
  }

  .profile-pic > p {
    font-size: 1.25em;
    width: 50vh;
  }

  .profile-info {
    flex: 1;
  }

  .profile-info {
    font-size: 1.4em;
  }

  .profile-section {
    display: flex;
    flex-direction: row;
  }

  .profile-section > span,
  .profile-section > table {
    margin-left: auto;
  }

  caption {
    font-size: 1.5em;
    text-align: center;
    margin-top: 15px;
    margin-bottom: 15px;
    font-weight: bold;
  }

  p {
    margin-top: 0;
  }

  td,
  th {
    padding-bottom: 5px;
    padding-left: 20px;
  }

  hr {
    margin: 20px 0;
  }

  table {
    text-align: right;
  }

  button {
    background: #5a5d63;
    color: white;
    font-size: 1.25em;
    border-radius: 3px;
    padding: 5px;
    border: none;
    margin-top: 15px;
  }

  em {
    display: block;
  }
</style>

<div in:fade class="profile">
  <div class="profile-pic">
    <img src={userProfile.photoURL} alt="The profile of the user" />
    <caption>{userProfile.username}</caption>
    <!-- {#if userProfile.profile_desc}
      <p>{userProfile.profile_desc}</p>
    {:else if $currentUser.username === userProfile.username}
      <em>Add a description here for others to see!</em>
    {/if}
    {#if $currentUser.username === userProfile.username}
      <button on:click={handleEditProfile}>Edit Profile</button>
    {/if} -->
  </div>
  <div class="profile-info">
    <div class="profile-section">
      <strong>Highest WPM:</strong>
      <span>{Math.round(userProfile.typing_stats.highest_wpm)}</span>
    </div>
    <hr />
    <div class="profile-section">
      <strong>Average WPM:</strong>
      <span>{Math.round(userProfile.typing_stats.avg_wpm)}</span>
    </div>
    <hr />
    <div class="profile-section">
      <strong>Average Accuracy:</strong>
      <span>{Math.round(userProfile.typing_stats.avg_accuracy)}</span>
    </div>
    <hr />
    <div class="profile-section">
      <strong>Last 5 Tests:</strong>
      <table>
        <thead>
          <tr>
            <th>WPM</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {#if userProfile.typing_stats.test_stats}
            {#each lastFiveTests as stat}
              <tr>
                <td>{Math.round(stat.wpm)}</td>
                <td>{Math.round(stat.accuracy)}%</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>
