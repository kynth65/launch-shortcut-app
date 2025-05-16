// Renderer process
// Using the exposed electron contextBridge API

document.addEventListener('DOMContentLoaded', () => {
  // Get all app buttons
  const appButtons = document.querySelectorAll('.app-btn');
  
  // Add click event listener to each button
  appButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Check what type of button this is
      const app = button.getAttribute('data-app');
      const url = button.getAttribute('data-url');
      const multi = button.getAttribute('data-multi');
      
      if (multi === 'work') {
        // Launch multiple apps/sites for the Work button
        console.log('Clicking work button - sending multi-launch event');
        window.electron.send('multi-launch', 'work');
      } else if (app) {
        // Launch a single application
        console.log(`Clicking app button: ${app}`);
        window.electron.send('launch-app', app);
      } else if (url) {
        // Open a URL
        console.log(`Clicking URL button: ${url}`);
        window.electron.send('open-url', url);
      }
      
      // Add a visual feedback when clicked
      button.classList.add('clicked');
      setTimeout(() => {
        button.classList.remove('clicked');
      }, 200);
    });
  });
  
  console.log('Event listeners attached to buttons');
});