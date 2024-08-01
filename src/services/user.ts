import { dataSource } from "../../ormconfig";
import { User } from "../entities/user";

const userRepository = dataSource.getRepository(User);

/**
 * stores an array of user objects in db
 * @param data - Array of user objects to store. Each object contain `name , age , address and additional_field`
 * @returns A string message
 */

export const storeUsers = async (data) => {
  if (!data) {
    return new Error("data is not provided");
  }
  try {
    const res = data.map(({ name, age, address, ...additional_info }) => {
      return {
        name: name.firstName + " " + name.lastName,
        age,
        address,
        additional_info,
      };
    });
    await userRepository.save(res);
    return "saved successfully !!";
  } catch (err) {
    console.log(err);
  }
};

/**
 * Calculates the age distribution percentage
 * @returns An object containing the percentage distribution of age groups.
 */
export const calculateAgeDistribution = async () => {
  try {
    const totalUsers = await userRepository.count();
    if (!totalUsers) {
      return false;
    }
    const { countLessThan20, count20To40, count40To60, countGreaterThan60 } =
      await userRepository
        .createQueryBuilder("user")
        .select([
          'SUM(CASE WHEN user.age < :ageLessThan20 THEN 1 ELSE 0 END) AS "countLessThan20"',
          'SUM(CASE WHEN user.age BETWEEN :minAge20_40 AND :maxAge20_40 THEN 1 ELSE 0 END) AS "count20To40"',
          'SUM(CASE WHEN user.age BETWEEN :minAge40_60 AND :maxAge40_60 THEN 1 ELSE 0 END) AS "count40To60"',
          'SUM(CASE WHEN user.age > :ageGreaterThan60 THEN 1 ELSE 0 END) AS "countGreaterThan60"',
        ])
        .setParameters({
          ageLessThan20: 20,
          minAge20_40: 20,
          maxAge20_40: 40,
          minAge40_60: 40,
          maxAge40_60: 60,
          ageGreaterThan60: 60,
        })
        .getRawOne();

    const distribution = {
      "< 20": percentageCalculator(countLessThan20, totalUsers),
      "20 to 40": percentageCalculator(count20To40, totalUsers),
      "40 to 60": percentageCalculator(count40To60, totalUsers),
      "> 60": percentageCalculator(countGreaterThan60, totalUsers),
    };
    return distribution;
  } catch (err) {
    console.log(err);
  }
};

/**
 * Print the age distrubtion result to console log
 * @param distribution - Object age group percentages.
 */
export const printResult = (distrubtionAge) => {
  console.log('-'.repeat(31));
  console.log(`| Age-Group  | % Distribution |`);
  console.log('-'.repeat(31));
  for (let key in distrubtionAge) {
    console.log(`| ${key.padEnd(10)} |  ${distrubtionAge[key].padEnd(12)}  |`);
    console.log('-'.repeat(31));
  };
};

const percentageCalculator = (count: number, total: number) => {
  return ((count / total) * 100).toFixed(2);
};
