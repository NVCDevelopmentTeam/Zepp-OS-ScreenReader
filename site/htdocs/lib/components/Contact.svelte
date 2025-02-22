<script>
  import { accessKey } from '$lib/info.js';
  let status = '';

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

<form onsubmit={handleSubmit} class="flex flex-col w-72 mx-auto space-y-4">
  <input type="hidden" name="access_key" value={accessKey}>

  <label for="name" class="text-gray-700 font-medium">
    Name <span class="text-red-500">*</span>
  </label>
  <input class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" type="text" id="name" name="name" required />

  <label for="email" class="text-gray-700 font-medium">
    Email <span class="text-red-500">*</span>
  </label>
  <input class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" type="email" id="email" name="email" required />

  <label for="title" class="text-gray-700 font-medium">
    Title <span class="text-red-500">*</span>
  </label>
  <input class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" type="text" id="title" name="title" required />

  <label for="message" class="text-gray-700 font-medium">
    Message <span class="text-red-500">*</span>
  </label>
  <textarea class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" id="message" name="message" required rows="3"></textarea>

  <input type="submit" value="Send" class="bg-blue-700 text-white rounded py-2 cursor-pointer hover:bg-blue-800" />
</form>

<div class="text-center mt-4 text-gray-600">{status}</div>
