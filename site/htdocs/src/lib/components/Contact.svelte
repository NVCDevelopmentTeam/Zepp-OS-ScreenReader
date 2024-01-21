<script>
  let status = "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    status = 'Submitting...';

    const formData = new FormData(event.currentTarget);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: json,
    });

    const result = await response.json();

    if (result.success) {
      console.log(result);
      status = result.message || "Success";
    }
  };
</script>

<h2>Contact form</h2>
<form on:submit="{handleSubmit}">
  <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">

  <label class="required" for="name">Name</label>
  <input class="field req" type="text" id="name" name="name" required />

  <label class="required" for="email">Email</label>
  <input class="field req" type="email" id="email" name="email" required />

  <label class="required" for="title">Title</label>
  <input class="field req" type="text" id="title" name="title" required />

  <label class="required" for="message">Message</label>
  <textarea class="field req" id="message" name="message" required rows="3"></textarea>

  <input type="submit" value="Send" />
</form>

<div>{status}</div>

<style>
  .required::after {
    content: " *";
    color: red;
  }

  form {
    display: flex;
    flex-direction: column;
    width: 300px;
  }
</style>