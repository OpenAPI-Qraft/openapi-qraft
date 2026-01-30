import micromatch from 'micromatch';

/**
 * Create a function to match service paths
 * @param servicesGlob
 */
export const createServicePathMatch = (servicesGlob: string[]) => {
  const servicePathGlobs = servicesGlob.reduce<
    Record<'match' | 'ignore', string[]>
  >(
    (acc, glob) => {
      if (glob.startsWith('!')) acc.ignore.push(glob.slice(1));
      else acc.match.push(glob);
      return acc;
    },
    {
      match: [],
      ignore: [],
    }
  );

  return function isServicePatchMatch(path: string) {
    return micromatch.isMatch(path, servicePathGlobs.match, {
      ignore: servicePathGlobs.ignore,
    });
  };
};
