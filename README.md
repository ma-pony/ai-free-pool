# AI Free Pool - Discover AI Free Credit Campaigns

🚀 **AI Free Pool** is a platform dedicated to sharing AI free credit campaigns, helping users discover and track various AI tools' free credit offers. Built with Next.js 16, TypeScript, Tailwind CSS 4, and modern web technologies.

## 🌟 About

AI Free Pool (AI 免费资源池) aggregates free credit campaigns from various AI platforms like OpenAI, Anthropic, Google AI, and more. Users can:

- 🔍 **Discover** the latest AI free credit campaigns
- 📊 **Track** campaign validity through community feedback
- 💬 **Share** experiences and tips in comments
- 🔖 **Bookmark** interesting campaigns for later
- 🌐 **Browse** in English or Chinese with AI-powered translations
- 📱 **Access** from any device with mobile-first responsive design

## 🚀 Deployment Status

**Status:** ✅ Ready for Deployment (pending TypeScript fixes)

The project is fully configured and documented for production deployment to Vercel.

### Deployment Documentation

- 📋 [Deployment Summary](DEPLOYMENT_SUMMARY.md) - Overview of deployment preparation
- 📖 [Deployment Guide](DEPLOYMENT.md) - Comprehensive deployment guide
- 🔧 [Vercel Deployment Guide](VERCEL_DEPLOYMENT_GUIDE.md) - Step-by-step Vercel setup
- ✅ [Pre-Deployment Checklist](PRE_DEPLOYMENT_CHECKLIST.md) - Complete checklist
- 🔍 [Post-Deployment Verification](POST_DEPLOYMENT_VERIFICATION.md) - Verification guide
- 🔧 [TypeScript Fixes Guide](TYPESCRIPT_FIXES_GUIDE.md) - Fix TypeScript errors
- ⚡ [Quick Reference](DEPLOYMENT_QUICK_REFERENCE.md) - Quick deployment reference

### Next Steps

1. Fix TypeScript errors (see [TYPESCRIPT_FIXES_GUIDE.md](TYPESCRIPT_FIXES_GUIDE.md))
2. Complete [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)
3. Follow [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)
4. Verify deployment with [POST_DEPLOYMENT_VERIFICATION.md](POST_DEPLOYMENT_VERIFICATION.md)

## ✨ Key Features

### Platform Features
- 🎯 **Campaign Management**: Browse, search, and filter AI free credit campaigns
- 👥 **User Contributions**: Submit new campaigns for community benefit
- ⚡ **Quick Reactions**: Vote on campaign validity (still works, expired, incorrect info)
- 💬 **Comment System**: Share experiences with nested replies and emoji reactions
- 🔖 **Bookmarks**: Save campaigns for later reference
- 🏷️ **Smart Tagging**: Filter by conditions (new users, credit card required, etc.)
- 📊 **Difficulty Levels**: Auto-calculated based on registration requirements
- 🌐 **Bilingual Support**: English and Chinese with AI-powered translations
- 📱 **Mobile-First**: Optimized for mobile devices with responsive design
- 🔒 **Secure**: Bot detection, rate limiting, and API encryption

### Technical Features

Built on a modern tech stack with developer experience in mind:

- ⚡ [Next.js](https://nextjs.org) with App Router support
- 🔥 Type checking [TypeScript](https://www.typescriptlang.org)
- 💎 Integrate with [Tailwind CSS](https://tailwindcss.com)
- ✅ Strict Mode for TypeScript and React 19
- 🔒 Authentication with [Clerk](https://clerk.com?utm_source=github&utm_medium=sponsorship&utm_campaign=nextjs-boilerplate): Sign up, Sign in, Sign out, Forgot password, Reset password, and more.
- 👤 Passwordless Authentication with Magic Links, Multi-Factor Auth (MFA), Social Auth (Google, Facebook, Twitter, GitHub, Apple, and more), Passwordless login with Passkeys, User Impersonation
- 📦 Type-safe ORM with DrizzleORM, compatible with PostgreSQL, SQLite, and MySQL
- 💽 Offline and local development database with PGlite
- ☁️ Remote and production database with Neon (PostgreSQL)
- 🌐 Multi-language (i18n) with next-intl and [Crowdin](https://l.crowdin.com/next-js)
- ♻️ Type-safe environment variables with T3 Env
- ⌨️ Form handling with React Hook Form
- 🔴 Validation library with Zod
- 📏 Linter with [ESLint](https://eslint.org) (default Next.js, Next.js Core Web Vitals, Tailwind CSS and Antfu configuration)
- 💖 Code Formatter with Prettier
- 🦊 Husky for Git Hooks (replaced by Lefthook)
- 🚫 Lint-staged for running linters on Git staged files
- 🚓 Lint git commit with Commitlint
- 📓 Write standard compliant commit messages with Commitizen
- 🔍 Unused files and dependencies detection with Knip
- 🌍 I18n validation and missing translation detection with i18n-check
- 🦺 Unit Testing with Vitest and Browser mode (replacing React Testing Library)
- 🧪 Integration and E2E Testing with Playwright
- 👷 Run tests on pull request with GitHub Actions
- 🎉 Storybook for UI development
- 🐰 AI-powered code reviews with [CodeRabbit](https://www.coderabbit.ai?utm_source=next_js_starter&utm_medium=github&utm_campaign=next_js_starter_oss_2025)
- 🚨 Error Monitoring with [Sentry](https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo)
- 🔍 Local development error monitoring with Sentry Spotlight
- ☂️ Code coverage with [Codecov](https://about.codecov.io/codecov-free-trial/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo)
- 📝 Logging with LogTape and Log Management with [Better Stack](https://betterstack.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate)
- 🖥️ Monitoring as Code with [Checkly](https://www.checklyhq.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate)
- 🔐 Security and bot protection ([Arcjet](https://launch.arcjet.com/Q6eLbRE))
- 📊 Analytics with PostHog
- 🎁 Automatic changelog generation with Semantic Release
- 🔍 Visual regression testing
- 💡 Absolute Imports using `@` prefix
- 🗂 VSCode configuration: Debug, Settings, Tasks and Extensions
- 🤖 SEO metadata, JSON-LD and Open Graph tags
- 🗺️ Sitemap.xml and robots.txt
- 👷 Automatic dependency updates with Dependabot
- ⌘ Database exploration with Drizzle Studio and CLI migration tool with Drizzle Kit
- ⚙️ Bundler Analyzer
- 🌈 Include a FREE minimalist theme
- 💯 Maximize lighthouse score

Built-in features from Next.js:

- ☕ Minify HTML & CSS
- 💨 Live reload
- ✅ Cache busting

Optional features (easy to add):

- 🔑 Multi-tenancy, Role-based access control (RBAC)
- 🔐 OAuth for Single Sign-On (SSO), Enterprise SSO, SAML, OpenID Connect (OIDC), EASIE
- 🔗 Web 3 (Base, MetaMask, Coinbase Wallet, OKX Wallet)

### Philosophy

- Nothing is hidden from you, allowing you to make any necessary adjustments to suit your requirements and preferences.
- Dependencies are regularly updated on a monthly basis
- Start for free without upfront costs
- Easy to customize
- Minimal code
- Unstyled template
- SEO-friendly
- 🚀 Production-ready

### Requirements

- Node.js 22+ and npm

### Getting Started

#### Prerequisites
- Node.js 20+ and npm
- A Clerk account for authentication
- An OpenAI API key for translations
- (Optional) A Neon PostgreSQL database for production

#### Installation

1. Clone the repository:
```shell
git clone <repository-url> ai-free-pool
cd ai-free-pool
npm install
```

2. Set up environment variables:
```shell
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:
- **Clerk**: Get keys from [clerk.com](https://clerk.com) (enable Google & GitHub OAuth)
- **OpenAI**: Get API key from [platform.openai.com](https://platform.openai.com/api-keys)
- **Database**: Run `npm run neon:claim` for a persistent database
- **Arcjet**: Get key from [arcjet.com](https://launch.arcjet.com/Q6eLbRE)
- **Encryption**: Generate with `openssl rand -hex 32`

3. Run the development server:
```shell
npm run dev
```

Open http://localhost:3000 with your favorite browser to see the application.

> [!WARNING]
> Next.js Boilerplate ships with a fully working Postgres database for your local environment. This database is **temporary** and will expire after **72 hours** if you don't claim it.
>
> Once expired, the project won't be able to connect to the database, and it'll throw connection errors.
>
> To avoid the connection errors and make the database **persistent**, run `npm run neon:claim`. After claiming it, the database becomes persistent and suitable for production use as well.

> [!CAUTION]
> The authentication system requires environment variables to be set up. Please refer to the [Set up authentication](#set-up-authentication) section.

Need advanced features? Multi-tenancy & Teams, Roles & Permissions, Shadcn UI, End-to-End Typesafety with oRPC, Stripe Payment, Light / Dark mode. Try [Next.js Boilerplate Pro](https://nextjs-boilerplate.com/pro-saas-starter-kit).

### Set up Authentication with Clerk

1. Create a Clerk account at [Clerk.com](https://clerk.com)
2. Create a new application in the Clerk Dashboard
3. **Enable OAuth Providers**:
   - Go to "User & Authentication" → "Social Connections"
   - Enable **Google** and **GitHub** providers
   - Configure OAuth settings for each provider
4. Copy your keys and add them to `.env.local`:

```shell
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Now you have a fully functional authentication system with social login support.

### Set up Admin Permissions

To access the admin dashboard at `/admin`, you need to configure admin permissions:

**Quick Setup (5 minutes)**: See [ADMIN_QUICK_START.md](ADMIN_QUICK_START.md)

**Detailed Guide**: See [ADMIN_SETUP.md](ADMIN_SETUP.md)

Two methods available:
- **Method 1**: Add user IDs to `ADMIN_USER_IDS` environment variable (fastest)
- **Method 2**: Set `role: "admin"` in Clerk user metadata (recommended for production)

### Set up remote database

The project uses DrizzleORM, a type-safe ORM that is compatible with PostgreSQL, SQLite, and MySQL databases. By default, the project is configured to seamlessly work with PostgreSQL, and you have the flexibility to choose any PostgreSQL database provider of your choice.

When you launch the project locally for the first time, it automatically creates a temporary PostgreSQL database. This allows you to work with a PostgreSQL database without Docker or any additional setup.

This temporary database will **expire after 72 hours** if you don't claim it. To avoid connection errors and **make the database persistent**, simply run the following command:

```shell
npm run neon:claim
```

Then, follow the instructions provided in the terminal to complete the claiming process.

Once claimed, the database is suitable for production use. You can create separate database branches for development, staging, and production environments to keep data isolated.

#### Create a fresh and empty database

If you want to create a fresh and empty database, you just need to remove the following environment variables: `DATABASE_URL`, `DATABASE_URL_DIRECT` and `PUBLIC_INSTAGRES_CLAIM_URL` from the `.env.local` file.

Then, run the following command to create a new temporary database:

```shell
npm run dev
```

After the database is created, the connection strings will be automatically added to your `.env.local` file. And, don't forget to claim the database with `npm run neon:claim`.

### Translation (i18n) setup

For translation, the project uses `next-intl` combined with [Crowdin](https://l.crowdin.com/next-js). As a developer, you only need to take care of the English (or another default language) version. Translations for other languages are automatically generated and handled by Crowdin. You can use Crowdin to collaborate with your translation team or translate the messages yourself with the help of machine translation.

To set up translation (i18n), create an account at [Crowdin.com](https://l.crowdin.com/next-js) and create a new project. In the newly created project, you will be able to find the project ID. You will also need to create a new Personal Access Token by going to Account Settings > API. Then, in your GitHub Actions, you need to define the following environment variables: `CROWDIN_PROJECT_ID` and `CROWDIN_PERSONAL_TOKEN`.

After defining the environment variables in your GitHub Actions, your localization files will be synchronized with Crowdin every time you push a new commit to the `main` branch.

### Project structure

```shell
.
├── README.md                       # README file
├── .github                         # GitHub folder
│   ├── actions                     # Reusable actions
│   └── workflows                   # GitHub Actions workflows
├── .storybook                      # Storybook folder
├── .vscode                         # VSCode configuration
├── migrations                      # Database migrations
├── public                          # Public assets folder
├── src
│   ├── app                         # Next JS App (App Router)
│   ├── components                  # React components
│   ├── libs                        # 3rd party libraries configuration
│   ├── locales                     # Locales folder (i18n messages)
│   ├── models                      # Database models
│   ├── styles                      # Styles folder
│   ├── templates                   # Templates folder
│   ├── types                       # Type definitions
│   ├── utils                       # Utilities folder
│   └── validations                 # Validation schemas
├── tests
│   ├── e2e                         # E2E tests, also includes Monitoring as Code
│   └── integration                 # Integration tests
├── next.config.ts                  # Next JS configuration
└── tsconfig.json                   # TypeScript configuration
```

### Configuration Files

Key configuration files for AI Free Pool:

- **`.env.local`**: Your local environment variables (copy from `.env.local.example`)
- **`src/utils/AppConfig.ts`**: Application configuration (name, locales, etc.)
- **`CONFIGURATION.md`**: Detailed setup guide for all services
- **`next.config.ts`**: Next.js configuration
- **`src/models/Schema.ts`**: Database schema definition

### Customization

To customize the platform:

1. **Branding**: Update `AppConfig.ts` with your project details
2. **Favicon**: Replace files in `public/` directory
3. **Locales**: Add translations in `src/locales/` (en.json, zh.json)
4. **Theme**: Modify Tailwind CSS in `src/styles/global.css`
5. **Database**: Update schema in `src/models/Schema.ts`

You have full access to the source code for further customization. The sky's the limi

### Change database schema

To modify the database schema in the project, you can update the schema file located at `./src/models/Schema.ts`. This file defines the structure of your database tables using the Drizzle ORM library.

After making changes to the schema, generate a migration by running the following command:

```shell
npm run db:generate
```

This will create a migration file that reflects your schema changes.

After making sure your database is running, you can apply the generated migration using:

```shell
npm run db:migrate
```

There is no need to restart the Next.js server for the changes to take effect.

### Commit Message Format

The project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification, meaning all commit messages must be formatted accordingly. To help you write commit messages, the project provides an interactive CLI that guides you through the commit process. To use it, run the following command:

```shell
npm run commit
```

One of the benefits of using Conventional Commits is the ability to automatically generate GitHub releases. It also allows us to automatically determine the next version number based on the types of commits that are included in a release.

### CodeRabbit AI Code Reviews

The project uses [CodeRabbit](https://www.coderabbit.ai?utm_source=next_js_starter&utm_medium=github&utm_campaign=next_js_starter_oss_2025), an AI-powered code reviewer. CodeRabbit monitors your repository and automatically provides intelligent code reviews on all new pull requests using its powerful AI engine.

Setting up CodeRabbit is simple, visit [coderabbit.ai](https://www.coderabbit.ai?utm_source=next_js_starter&utm_medium=github&utm_campaign=next_js_starter_oss_2025), sign in with your GitHub account, and add your repository from the dashboard. That's it!

### Testing

All unit tests are located alongside the source code in the same directory, making them easier to find. The unit test files follow this format: `*.test.ts` or `*.test.tsx`. The project uses Vitest and React Testing Library for unit testing. You can run the tests with the following command:

```shell
npm run test
```

### Integration & E2E Testing

The project uses Playwright for integration and end-to-end (E2E) testing. Integration test files use the `*.spec.ts` extension, while E2E test files use the `*.e2e.ts` extension. You can run the tests with the following commands:

```shell
npx playwright install # Only for the first time in a new environment
npm run test:e2e
```

### Storybook

Storybook is configured for UI component development and testing. The project uses Storybook with Next.js and Vite integration, including accessibility testing and documentation features.

Stories are located alongside your components in the `src` directory and follow the pattern `*.stories.ts` or `*.stories.tsx`.

You can run Storybook in development mode with:

```shell
npm run storybook
```

This will start Storybook on http://localhost:6006 where you can view and interact with your UI components in isolation.

To run Storybook tests in headless mode, you can use the following command:

```shell
npm run storybook:test
```

### Local Production Build

Generate an optimized production build locally using a temporary in-memory Postgres database:

```shell
npm run build-local
```

This command:

- Starts a temporary in-memory Database server
- Runs database migrations with Drizzle Kit
- Builds the Next.js app for production
- Shuts down the temporary DB when the build finishes

Notes:

- By default, it uses a local database, but you can also use `npm run build` with a remote database.
- This only creates the build, it doesn't start the server. To run the build locally, use `npm run start`.

### Deploy to production

During the build process, database migrations are automatically executed, so there's no need to run them manually. However, you must define `DATABASE_URL` in your environment variables.

Then, you can generate a production build with:

```shell
$ npm run build
```

It generates an optimized production build of the boilerplate. To test the generated build, run:

```shell
$ npm run start
```

You also need to defined the environment variables `CLERK_SECRET_KEY` using your own key.

This command starts a local server using the production build. You can now open http://localhost:3000 in your preferred browser to see the result.

### Deploy to Sevalla

You can deploy a Next.js application along with its database on a single platform. First, create an account on [Sevalla](https://sevalla.com).

After registration, you will be redirected to the dashboard. From there, navigate to `Database > Create a database`. Select PostgreSQL and and use the default settings for a quick setup. For advanced users, you can customize the database location and resource size. Finally, click on `Create` to complete the process.

Once the database is created and ready, return to the dashboard and click `Application > Create an App`. After connecting your GitHub account, select the repository you want to deploy. Keep the default settings for the remaining options, then click `Create`.

Next, connect your database to your application by going to `Networking > Connected services > Add connection` and select the database you just created. You also need to enable the `Add environment variables to the application` option, and rename `DB_URL` to `DATABASE_URL`. Then, click `Add connection`.

Go to `Environment variables > Add environment variable`, and define the environment variables `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from your Clerk account. Click `Save`.

Finally, initiate a new deployment by clicking `Overview > Latest deployments > Deploy now`. If everything is set up correctly, your application will be deployed successfully with a working database.

### Error Monitoring

The project uses [Sentry](https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo) to monitor errors.

#### Local development with Sentry and Spotlight

In the development environment, no additional setup is required: Next.js Boilerplate comes pre-configured with Sentry and Spotlight (Sentry for Development). All errors are automatically captured by your local Spotlight instance, enabling testing without sending data to Sentry Cloud.

You can inspect captured events, view stack traces, and analyze errors in the Spotlight UI at `http://localhost:8969`.

#### Production setup with Sentry

For production environment, you'll need to create a Sentry account and a new project. Then, in `.env.production`, you need to update the following environment variables:

```shell
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORGANIZATION=
SENTRY_PROJECT=
```

You also need to create a environment variable `SENTRY_AUTH_TOKEN` in your hosting provider's dashboard.

### Code coverage

Next.js Boilerplate relies on [Codecov](https://about.codecov.io/codecov-free-trial/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo) for code coverage reporting solution. To enable Codecov, create a Codecov account and connect it to your GitHub account. Your repositories should appear on your Codecov dashboard. Select the desired repository and copy the token. In GitHub Actions, define the `CODECOV_TOKEN` environment variable and paste the token.

Make sure to create `CODECOV_TOKEN` as a GitHub Actions secret, do not paste it directly into your source code.

### Logging

The project uses LogTape for logging. In the development environment, logs are displayed in the console by default.

For production, the project is already integrated with [Better Stack](https://betterstack.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate) to manage and query your logs using SQL. To use Better Stack, you need to create a [Better Stack](https://betterstack.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate) account and create a new source: go to your Better Stack Logs Dashboard > Sources > Connect source. Then, you need to give a name to your source and select Node.js as the platform.

After creating the source, you will be able to view and copy your source token. In your environment variables, paste the token into the `NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN` variable. You'll also need to define the `NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST` variable, which can be found in the same place as the source token.

Now, all logs will automatically be sent to and ingested by Better Stack.

### Checkly monitoring

The project uses [Checkly](https://www.checklyhq.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate) to ensure that your production environment is always up and running. At regular intervals, Checkly runs the tests ending with `*.check.e2e.ts` extension and notifies you if any of the tests fail. Additionally, you have the flexibility to execute tests from multiple locations to ensure that your application is available worldwide.

To use Checkly, you must first create an account on [their website](https://www.checklyhq.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate). After creating an account, generate a new API key in the Checkly Dashboard and set the `CHECKLY_API_KEY` environment variable in GitHub Actions. Additionally, you will need to define the `CHECKLY_ACCOUNT_ID`, which can also be found in your Checkly Dashboard under User Settings > General.

To complete the setup, update the `checkly.config.ts` file with your own email address and production URL.

### Arcjet security and bot protection

The project uses [Arcjet](https://launch.arcjet.com/Q6eLbRE), a security as code product that includes several features that can be used individually or combined to provide defense in depth for your site.

To set up Arcjet, [create a free account](https://launch.arcjet.com/Q6eLbRE) and get your API key. Then add it to the `ARCJET_KEY` environment variable.

Arcjet is configured with two main features: bot detection and the Arcjet Shield WAF:

- [Bot detection](https://docs.arcjet.com/bot-protection/concepts) is configured to allow search engines, preview link generators e.g. Slack and Twitter previews, and to allow common uptime monitoring services. All other bots, such as scrapers and AI crawlers, will be blocked. You can [configure additional bot types](https://docs.arcjet.com/bot-protection/identifying-bots) to allow or block.
- [Arcjet Shield WAF](https://docs.arcjet.com/shield/concepts) will detect and block common attacks such as SQL injection, cross-site scripting, and other OWASP Top 10 vulnerabilities.

Arcjet is configured with a central client at `src/libs/Arcjet.ts` that includes the Shield WAF rules. Additional rules are applied when Arcjet is called in `proxy.ts`.

### Useful commands

### Code Quality and Validation

The project includes several commands to ensure code quality and consistency. You can run:

- `pnpm run lint` to check for linting errors
- `pnpm run lint:fix` to automatically fix fixable issues from the linter
- `pnpm run check:types` to verify type safety across the entire project
- `pnpm run check:deps` help identify unused dependencies and files
- `pnpm run check:i18n` ensures all translations are complete and properly formatted

#### Bundle Analyzer

Next.js Boilerplate includes a built-in bundle analyzer. It can be used to analyze the size of your JavaScript bundles. To begin, run the following command:

```shell
pnpm run build-stats
```

By running the command, it'll automatically open a new browser window with the results.

#### Database Studio

The project is already configured with Drizzle Studio to explore the database. You can run the following command to open the database studio:

```shell
pnpm run db:studio
```

Then, you can open https://local.drizzle.studio with your favorite browser to explore your database.

### VSCode information (optional)

If you are VSCode user, you can have a better integration with VSCode by installing the suggested extension in `.vscode/extension.json`. The starter code comes up with Settings for a seamless integration with VSCode. The Debug configuration is also provided for frontend and backend debugging experience.

With the plugins installed in your VSCode, ESLint and Prettier can automatically fix the code and display errors. The same applies to testing: you can install the VSCode Vitest extension to automatically run your tests, and it also shows the code coverage in context.

Pro tips: if you need a project wide-type checking with TypeScript, you can run a build with <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> on Mac.

### Contributions

Everyone is welcome to contribute to this project. Feel free to open an issue if you have any questions or find a bug. Totally open to suggestions and improvements.

### License

Licensed under the MIT License, Copyright © 2025

See [LICENSE](LICENSE) for more information.
