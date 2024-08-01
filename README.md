
# CSV To JSON convert


## Description

A project is about to convert csv file into JSON and store data into database and find percentage of age distribution.

## Tech Stack
  - Node.js
  - TypeScript
  - Express
  - TypeOrm
  - postgreSQL 

## Assumptions
  - Age distribution calculation is handled by a separate API.
 - The API always processes multiple data entries (array of objects) instead of single entries (object).
 - The CSV file path is read from an environment variable (.env)

## API 
  ### / csv-to-json | POST
  - Description :  

        1. Converts the CSV file to JSON
        2. formated the data and store into database
        4. retunrn JSON format users.
  - response :

        {
         "users" : [
           {
             user : { firstname , lastname } , 
             age : number ,
             ...others fields : according to csv files
           }
         ]
        }
       
  ### /age-distribution | GET
  - 
  - response :
        
        {
          "< 20": "20.13",
          "20 to 40": "20.34",
          "40 to 60": "20.20",
          "> 60": "40.45"
        }
  
## Optimization for large files
  - CSV file read using streams 
  - Data store to database in batch size


## How to Run the Project locally

### Step 1: Clone the Repository

```sh
   git clone  https://github.com/shilpashingnapure/CSV-to-JSON.git
```

### Step 2 : Navigate to Project Directory

```sh
  cd CSV-to-JSON
```

### Step 3 : Run Project 
  - if don't have postgreSQL install , can used docker-compose file.
      - Add database creditionals
      - run docker-compose file

   - `npm install`

   - `npm run dev`  or   `npm run build && npm start`

