import * as classnames from 'classnames';
import * as React from 'react';

import FrameType from '../FrameType';

import Head from './ApiHead';
import Body from './ApiBody';

export interface ItemProps {
  // only required for rare and unique items
  name?: string;
  typeLine: string;
  identified: boolean;
  category: { [key: string]: string[] };
  frameType: FrameType;
  elder?: boolean;
  shaper?: boolean;
  corrupted?: boolean;
  utilityMods?: React.ReactNode[];
  implicitMods?: React.ReactNode[];
  explicitMods?: React.ReactNode[];
  craftedMods?: React.ReactNode[];
  enchantMods?: React.ReactNode[];
  properties?: LineContent[];
  requirements?: LineContent[];
}

export interface LineContent {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
}

export interface Props {
  classname?: string;
  item: ItemProps;
  width?: number;
}

export interface State {
  width?: number;
  props: Props;
}

export default class ItemPopup extends React.PureComponent<Props, State> {
  public static defaultProps = {
    classname: 'poe-item',
  };

  public static DIMENSIONS = {
    min_width: 262.88032454361,
    max_width: 742.39350912779,
    max_description_width: 365.11156186613,
  };

  static getDerivedStateFromProps(next_props: Props, prevState: State) {
    // prev_props hack
    if (next_props === prevState.props) {
      return null;
    } else {
      // mark width for recomputation because we will render a different item
      return {
        width: next_props.width,
      };
    }
  }

  public static assertValidProps(
    item: ItemProps,
    onError: (err: string) => void,
  ) {
    if (item.elder && item.shaper) {
      onError('item can either be shaped or elder item but not both');
    }
  }

  private ref: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);

    if (process.env.NODE_ENV !== 'production') {
      ItemPopup.assertValidProps(props.item, console.warn);
    }

    this.ref = React.createRef();
    this.state = {
      width: props.width,
      props,
    };
  }

  public componentDidMount() {
    // https://reactjs.org/docs/react-component.html#componentdidmount
    // see section about measure a DOM node
    if (this.props.width === undefined) {
      // not fixed mode so compute
      this.computeWidth();
    }
  }

  public componentDidUpdate(prev_props: Props, prev_state: State) {
    if (this.state.width === undefined) {
      this.computeWidth();
    }
  }

  public render() {
    const { classname, item } = this.props;
    const { width } = this.state;
    const style = {
      width: width === undefined ? 'auto' : width,
      minWidth: ItemPopup.DIMENSIONS.min_width,
      maxWidth: ItemPopup.DIMENSIONS.max_width,
    };

    return (
      <div
        className={classnames(classname, FrameType[item.frameType])}
        style={style}
        ref={this.ref}
      >
        <Head item={item} />
        <Body item={item} />
      </div>
    );
  }

  /**
   * calculates the width of the popup as described in reasearch/popup-width
   */
  private computeWidth() {
    const element = this.ref.current;
    if (element !== null) {
      const width = Math.max(
        ...[...element.querySelectorAll('.lc')].map(lc => {
          return outerWidth(lc as HTMLElement) + 2;
        }),
        ...[
          ...element.querySelectorAll('.descrText span, .secDescrText span'),
        ].map(el => {
          // Todo "o.MaxDescriptionWidth"
          return Math.min(
            ItemPopup.DIMENSIONS.max_description_width,
            outerWidth(el as HTMLElement),
          );
        }),
      );
      this.setState({ width });
    }
  }
}

/**
 * jQuery outerWidth used on poe website
 * taken from http://youmightnotneedjquery.com/ search query: outerwidth
 * @param element
 */
function outerWidth(element: HTMLElement) {
  const width = element.offsetWidth;
  const style = getComputedStyle(element);

  return (
    width +
    parseInt(style.marginLeft || '0') +
    parseInt(style.marginRight || '0')
  );
}
