# Digital Twin

## Requirements

- PHP >= 8.3.2
- Composer >= 2.5.1
- npm >= 10.5.2
- Nodejs => 18.19.0

## Installation

**1. Install Dependencies:**

Install all dependencies required by Laravel using Composer

``` compose install ```

**2. Configure Environment:**

Copy .env.example in .env and configure the passwords

``` cp .env.example .env ```

**3. Build and Run Docker**

Build and run docker using Sail, adding ```-d``` for detached mode (background process)

``` ./vendor/bin/sail up ```

**4. Set up Sail Alias (Optional):**

You can optionally configure an alias for the `sail` command in your shell's configuration file (e.g., `.bashrc`). This allows you to use `sail` directly instead of the full path

``` alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)' ```

**5. Install React Dependencies (Using Sail):**

Install all dependencies required by the React frontend project

``` sail npm install ```

**6. Generate Laravel App Key:**

Generate a secret key for your Laravel application using Artisan

``` sail artisan key:generate ```

**7. Create Database Migrations:**

Create the database tables based on your migration files

``` sail artisan migrate ```

## Usage

### Start Application

**1. Start Backend:**

Start the Laravel backend server using Sail in detached mode

``` sail up -d```

**2. Start Frontend:**

Start the React development server:

``` sail npm run dev ```

### Adding user 

**1. Access Tinker Console:**

Use Tinker to interact with the Laravel application directly from the command line:

``` sail artisan ti ```

**2. Create a New User:**

Inside the Tinker console, you can create a new user with the following command (replace `'test'` and `'test@digital.twin'` with your desired values):

``` User::create(['name' => 'test', 'email' => 'test@digital.twin', 'password'=>Hash::make('password')]); ```

### Stop Application

To stop all running Docker containers:

``` sail stop ```

### URL

Frontend: ```http://localhost```
Mailpit: ```http://localhost:8025``