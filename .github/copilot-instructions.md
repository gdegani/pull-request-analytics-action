# Pull request analytics action

This GitHub Action measures metrics for developers and/or teams. Reports are generated in issues based on user actions such as opening/closing pull requests, requesting/conducting reviews, opening discussions, and more. The action is designed to provide better insights into team strengths and identify bottlenecks.

## architecture
This is a Node.js application that interacts with the GitHub API to fetch and analyze pull request data. It uses environment variables and command-line arguments for configuration, allowing flexibility in specifying organizations, repositories, and time frames for analysis.
Use typescript for better maintainability and type safety.


## Guidelines for contributing
- Follow best practices for Node.js and TypeScript development.
- Write clear and concise code with appropriate comments.
- Write unit tests for new features and bug fixes with a code coverage of at least 80% for each source file.
- Ensure compatibility with the latest LTS version of Node.js.

## Other
- If the request in the chat is not clear ask for more details.
- Keep documentation updated with any code changes.