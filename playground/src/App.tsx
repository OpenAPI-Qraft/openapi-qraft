import { createQueryCraft } from '@radist2s/qraft/createQueryCraft';

import { Services, services } from './api';
import { MONITE_VERSION } from './constants.ts';

const qraft = createQueryCraft<Services>(services);

function App() {
  const { data } = qraft.entityUsers.getEntityUsersMe.useQuery({
    header: {
      'x-monite-version': MONITE_VERSION,
    },
  });

  return <>{data?.first_name}</>;
}

export default App;
