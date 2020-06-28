<script>
  import { NotificationDisplay, notifier } from "@beyonk/svelte-notifications";
  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";
  import { digestMessage } from "../utils";
  import fire from "../config/fire";
  import Identicon from "identicon.js";
  import { goto } from "@sapper/app";
  import User from "../models/user";
  import { currentUser } from "../stores/currentUser";

  const { form, errors, state, handleChange, handleSubmit } = createForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
    validationSchema: yup.object().shape({
      username: yup
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username can't be more than 30 characters")
        .test("unique-username", "Username already taken", async function(
          value
        ) {
          let duplicate = false;

          await fire
            .database()
            .ref(`usernames/${value}`)
            .once("value", snapshot => {
              duplicate = snapshot.exists();
            });

          return !duplicate;
        })
        .required("Username is required"),
      email: yup
        .string()
        .email("Invalid email address")
        .required("Email address is required"),
      password: yup
        .string()
        .min(6, "Password must be at least 6 characters long")
        .required("Password is required"),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords don't match")
        .required("Password confirm is required")
    }),
    onSubmit: values => {
      const { username, email, password } = values;

      fire
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(async data => {
          const { user } = data;
          if (user) {
            // Create the user's default profile image from email hash
            let emailHash = await digestMessage(user.email);
            let options = {
              background: [255, 255, 255, 255], // rgba white background
              size: 420,
              format: "svg"
            };

            let data = new Identicon(emailHash, options).toString();
            let imageData = `data:image/svg+xml;base64,${data}`;
            let avatarRef = fire.storage().ref(`profile/${user.uid}`);

            await avatarRef.putString(imageData, "data_url");

            let url = await avatarRef.getDownloadURL();

            // Update user profile after creating profile image
            await user.updateProfile({
              displayName: user.displayName,
              photoURL: url
            });

            // Add username and uid bindings to db for easy access
            let usernamesUpdate = {};
            usernamesUpdate[username] = user.uid;

            let usersUpdate = {};
            usersUpdate[`${user.uid}/username`] = username;
            usersUpdate[`${user.uid}/typing_stats`] = {
              highest_wpm: 0,
              avg_wpm: 0,
              avg_accuracy: 0,
              test_stats: [] // A stat is of the form {wpm: val, accuracy: val}
            };
            usersUpdate[`${user.uid}/profile_desc`] = "";
            usersUpdate[`${user.uid}/photoURL`] = user.photoURL;

            await fire
              .database()
              .ref("usernames")
              .update(usernamesUpdate);

            await fire
              .database()
              .ref("users")
              .update(usersUpdate);

            $currentUser = new User(
              username,
              user.email,
              user.uid,
              user.photoURL
            );

            // Navigate to main page after sign in
            await goto("/");
          }
        })
        .catch(err => {
          notifier.danger(err, 2500);
        });
    }
  });
</script>

<style>
  form {
    display: flex;
    flex-direction: column;
    padding: 35px;
    margin-top: 15px;
    border-radius: 7px;
    min-width: 40%;
    background: #c8d2e0;
  }

  input {
    border: none transparent;
    outline: none;
    background: #9aa2ad;
    border-radius: 3px;
    padding: 10px;
    line-height: 1.25em;
    border-bottom: 3px solid transparent;
  }

  input:focus {
    border-bottom: 3px solid #333;
  }

  label {
    font-size: 1.25em;
  }

  button {
    background: #5a5d63;
    color: white;
    margin-top: 25px;
    font-size: 1.25em;
    border-radius: 3px;
    padding: 5px;
    border: none;
  }

  h1 {
    margin: 0 0 25px;
    font-size: 1.75em;
    font-weight: bold;
  }

  .error {
    color: red;
    height: 1em;
    margin-bottom: 5px;
  }

  .input-field {
    display: flex;
    flex-direction: column;
  }
</style>

<NotificationDisplay />
<form on:submit={handleSubmit}>
  <h1>Register</h1>
  <div class="input-field">
    <label for="username">Username</label>
    <input
      type="text"
      name="username"
      id="username"
      on:change={handleChange}
      on:blur={handleChange}
      bind:value={$form.username} />
    <span class="error">{$errors.username}</span>
  </div>
  <div class="input-field">
    <label for="emailRegister">Email</label>
    <input
      type="text"
      name="email"
      id="emailRegister"
      on:change={handleChange}
      on:blur={handleChange}
      bind:value={$form.email} />
    <span class="error">{$errors.email}</span>
  </div>
  <div class="input-field">
    <label for="passwordRegister">Password</label>
    <input
      type="password"
      name="password"
      id="passwordRegister"
      on:change={handleChange}
      on:blur={handleChange}
      bind:value={$form.password} />
    <span class="error">{$errors.password}</span>
  </div>
  <div class="input-field">
    <label for="confirmPassword">Confirm Password</label>
    <input
      type="password"
      name="confirmPassword"
      id="confirmPassword"
      on:change={handleChange}
      on:blur={handleChange}
      bind:value={$form.confirmPassword} />
    <span class="error">
      {$form.confirmPassword === $form.password ? '' : $errors.confirmPassword}
    </span>
  </div>
  <button type="submit">Register</button>
</form>
