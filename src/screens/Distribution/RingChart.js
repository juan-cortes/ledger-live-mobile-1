// @flow

import React, { PureComponent } from "react";
import { View } from "react-native";
import * as d3shape from "d3-shape";
import Svg, { Path, G, Circle, Line } from "react-native-svg";
import colors from "../../colors";
import type { DistributionItem } from "./DistributionCard";

type Props = {
  data: *,
  style?: *,
  selectedKey: () => *,
};

type State = {
  highlight: number,
};

class RingChart extends PureComponent<Props, State> {
  state = {
    highlight: undefined,
  };

  static defaultProps = {
    data: [],
  };

  arcGenerator = d3shape.arc();
  reducer = (data: *, item: DistributionItem, index) => {
    const { highlight } = this.state;
    const increment = item.distribution * 2 * Math.PI;
    const chosen = index === highlight;
    const pathData = this.arcGenerator({
      startAngle: data.angle,
      endAngle: data.angle + increment,
      innerRadius: chosen ? 28 : 30,
      outerRadius: chosen ? 42 : 40,
      cornerRadius: 2,
    });

    const midAngle = (data.angle+increment/2);
    const x = 42*Math.cos(-1.5707963268+midAngle);
    const y = 42*Math.sin(-1.5707963268+midAngle);

    const notch = chosen
      ? [x,y]
      : data.notch;

    const parsedItem = {
      // $FlowFixMe
      color: item.currency.color || colors.live,
      pathData,
      id: item.currency.id,
      index,
    };

    return {
      items: [...data.items, parsedItem],
      angle: data.angle + increment,
      notch,
    };
  };

  onPathPress = index => {
    this.props.selectedKey(index);
    this.setState({ highlight: index }, () =>
      this.setState({
        paths: this.props.data.reduce(this.reducer, { items: [], angle: 0 }),
      }),
    );
  };

  componentDidMount() {
    this.setState({
      paths: this.props.data.reduce(this.reducer, {
        items: [],
        angle: 0,
        notch: undefined,
      }),
    });
  }

  render() {
    const { style } = this.props;
    const { paths, highlight } = this.state;
    const notch = paths ? paths.notch : undefined;
    return (
      <View style={style}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <G transform="translate(50, 50)">
            {paths &&
              paths.items.map(({ pathData, color, id, index }) => (
                  <Path
                    key={id}
                    onPress={() => this.onPathPress(index)}
                    stroke={colors.white}
                    strokeWidth={0.5}
                    fill={color}
                    d={pathData}
                  />
              ))}
            {notch && highlight && (
              <G>
                <Circle cx={notch[0]} cy={notch[1]} r="4" fillOpacity={0.2} fill="#fff" />
                <Circle cx={notch[0]} cy={notch[1]} r="2" fill={paths.items[highlight].color} />
              </G>
            )}
          </G>
        </Svg>
      </View>
    );
  }
}

export default RingChart;
