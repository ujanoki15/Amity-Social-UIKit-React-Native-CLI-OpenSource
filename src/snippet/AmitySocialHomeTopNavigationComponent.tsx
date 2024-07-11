/* begin_sample_code
 gist_id: 2fb673457852733b32555728606db1b6
 filename: AmitySocialHomeTopNavigationComponent.tsx
 asc_page: https://docs.amity.co/amity-uikit/uikit-v4-beta
 description: AmitySocialHomeTopNavigationComponent
 */
import {
  AmitySocialHomeTopNavigationComponent,
  AmityUiKitProvider,
} from 'amity-react-native-social-ui-kit';
import React from 'react';
import config from '../../uikit.config.json';
<AmityUiKitProvider
  configs={config} //put your customized config json object
  apiKey="API_KEY"
  apiRegion="API_REGION"
  userId="userId"
  displayName="displayName"
  apiEndpoint="https://api.{API_REGION}.amity.co"
  behaviour={{
    AmitySocialHomeTopNavigationComponentBehaviour: { onPressCreate: () => {} },
  }}
>
  <AmitySocialHomeTopNavigationComponent activeTab={'Newsfeed'} />
</AmityUiKitProvider>;
/* end_sample_code */
