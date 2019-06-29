const target: string = "constexpr ::std::ptrdiff_t m_Collision = 0x31C;";
const population_size: number = 1000;
const generations: number = 10000;
const mutation_chance: number = 0.1;

interface Individual {
  phrase: string;
  fitness: number;
}

const random_string = (length: number): string =>
  /**
   * 32 = ' ' on ascii table
   * 122 = z on ascii table
   */
  [...Array(length).keys()]
    .map(_ => String.fromCharCode(Math.floor(Math.random() * (122 - 32)) + 32))
    .join("");

const evaluate_fitness = (phrase: string): number => {
  let fitness: number = 0;
  for (let i = 0; i < phrase.length; ++i) {
    if (phrase[i] === target[i]) ++fitness;
  }

  return fitness;
};

const generate_population = (population_size: number): Array<Individual> =>
  [...Array(population_size).keys()].map(_ => {
    const phrase: string = random_string(target.length);
    const fitness: number = Math.pow(evaluate_fitness(phrase), 2);

    return {
      phrase,
      fitness
    };
  });

const get_most_fit = (a: Individual, b: Individual): Individual =>
  a.fitness > b.fitness ? a : b;

const get_least_fit = (a: Individual, b: Individual): Individual =>
  a.fitness < b.fitness ? a : b;

const get_best_individual = (population: Array<Individual>): Individual =>
  population.reduce(
    (best, current) => (current.fitness > best.fitness ? current : best),
    population[0]
  );

const maybe_mutate = (
  individual: Individual,
  mutation_rate: number = 0.01
): Individual => {
  if (Math.random() < mutation_rate) {
    const random_index_a: number = Math.floor(
      Math.random() * individual.phrase.length
    );
    const random_index_b: number = Math.floor(
      Math.random() * individual.phrase.length
    );

    let new_phrase: Array<string> = individual.phrase.split("");

    new_phrase[random_index_a] = random_string(1);
    new_phrase[random_index_b] = random_string(1);

    individual.phrase = new_phrase.join("");

    individual.fitness = Math.pow(evaluate_fitness(individual.phrase), 2);
  }

  return individual;
};

const crossover = (
  individual_a: Individual,
  individual_b: Individual
): Array<Individual> => {
  const child_a_phrase =
    individual_a.phrase.substr(0, individual_a.phrase.length / 2) +
    individual_b.phrase.substr(individual_b.phrase.length / 2);

  const child_a_fitness = Math.pow(evaluate_fitness(child_a_phrase), 2);

  const child_b_phrase =
    individual_b.phrase.substr(0, individual_b.phrase.length / 2) +
    individual_a.phrase.substr(individual_a.phrase.length / 2);

  const child_b_fitness = Math.pow(evaluate_fitness(child_b_phrase), 2);

  return [
    maybe_mutate(
      {
        phrase: child_a_phrase,
        fitness: child_a_fitness
      },
      mutation_chance
    ),
    maybe_mutate(
      {
        phrase: child_b_phrase,
        fitness: child_b_fitness
      },
      mutation_chance
    )
  ];
};

const select = (population: Array<Individual>): Individual =>
  population[Math.floor(Math.random() * population.length)];

const tournament = (
  population: Array<Individual>,
  p: number = 0.8
): Individual => {
  const individual_a = select(population);
  const individual_b = select(population);

  return Math.random() < p
    ? get_most_fit(individual_a, individual_b)
    : get_least_fit(individual_a, individual_b);
};

const evolve = (
  population: Array<Individual>,
  generations: number = 1
): void => {
  let new_population = [];

  for (let i = 0; i < generations; ++i) {
    while (new_population.length !== population.length) {
      new_population.push(
        ...crossover(tournament(population), tournament(population))
      );
    }

    population = new_population;
    new_population = [];

    console.log(
      "Population size ->",
      population.length,
      " --- ",
      "Generation ->",
      i,
      " --- ",
      "Best ->",
      get_best_individual(population)
    );
  }
};

evolve(generate_population(population_size), generations);
