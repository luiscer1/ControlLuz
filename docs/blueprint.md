# **App Name**: Luz Control

## Core Features:

- Device Discovery: Automatically scan the local network to find and display available ESP32/ESP8266 devices using local HTTP requests.
- Device Management (Add, Edit, Delete & Persistence): Allow users to add new devices manually (via IP), and to edit (change name or IP) or delete existing devices from the list via a long-press menu on the main screen. The list of devices is persistently stored using AsyncStorage.
- Basic Light Control: Send commands to toggle connected lights on/off and adjust brightness levels if supported by the device, communicating via local HTTP requests.
- Real-time Status Display: Display the current state (on/off, brightness) of all connected and active light devices, updated in real-time via local HTTP polling.
- Integrated Configuration Guide: Provide an in-app 'Guide' section with example code for ESP32/ESP8266 devices, allowing users to easily copy it directly to their clipboard, along with clear 4-step instructions (Connect, Upload, Serial Monitor, Add IP) for initial device setup within the Arduino IDE. This ensures users can get their ESP devices ready without leaving the app.

## Style Guidelines:

- The palette is light and modern, designed to convey clarity and technological control, with high contrast for improved accessibility. The primary color is a vibrant blue (#1A73E8), chosen to evoke precision and a clean interface. The background is an almost-white, very subtle light grey-blue (#F5F7FA), providing an expansive, clean canvas. An expressive purple (#6C3DEB) serves as the accent, offering contrast and signaling key interactive elements.
- Body and headline font: 'Inter' (sans-serif) for its modern, objective, and neutral aesthetic, ensuring excellent readability and a polished feel throughout the application. Emphasis on a legible and dignified appearance.
- Use clear, concise icons that represent common smart home actions and device states (e.g., light bulb icons, power toggles, sliders for brightness). Prioritize simple, line-based designs for a minimalist and modern look.
- Implement a clean, card-based layout for listing devices, ensuring each device's status and controls are easily accessible and visually distinct. Maintain consistent padding and margins for a balanced and intuitive user experience. The overall design should be minimalist and legible.
- Incorporate subtle feedback animations for button presses, toggle switches, and connection status changes to enhance user interaction and indicate system responsiveness. Include haptic feedback (vibration) upon button presses to provide tactile confirmation.