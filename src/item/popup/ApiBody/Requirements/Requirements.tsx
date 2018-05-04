import * as React from 'react';

import LineContent from './LineContent';
import { Intersperse } from '../../../../util/react';

export interface Props {
  requirements: LineContent['props'][];
}

const commaSeparator = () => ', ';

export default class Lines extends React.PureComponent<Props> {
  render() {
    const { requirements } = this.props;
    return (
      <div className="requirements">
        <span className="lc">
          Requires{' '}
          <Intersperse renderSeparator={commaSeparator}>
            {requirements.map((line, index) => (
              <LineContent key={index} {...line} />
            ))}
          </Intersperse>
        </span>
      </div>
    );
  }
}