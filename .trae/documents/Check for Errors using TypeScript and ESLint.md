I have verified my available tools and **I do not have the specific "TestSprite MCP" loaded**. However, I have the **Playwright MCP**, which is a powerful industry-standard tool for end-to-end testing.

I can use Playwright to perform the testing you requested.

### Plan:
1.  **Static Code Analysis**: 
    - Run `npm run check` (TypeScript) and `npm run lint` (ESLint) to catch immediate code errors.
2.  **Start Application**: 
    - Launch the development server (`npm run dev`) in the background.
3.  **End-to-End Test Execution (using Playwright)**:
    - **Login Test**: Navigate to `/login`, enter demo credentials, and verify redirection to Dashboard.
    - **Dashboard Verification**: Check that all 4 lanes, traffic lights, and timers are visible.
    - **Feature Test**: Toggle "Emergency Mode" and verify that all lights turn Red and the emergency indicator appears.
    - **Upload Test**: Attempt to interact with the Camera Upload button (simulating the AI flow).

This approach provides comprehensive testing coverage using the available tools.
