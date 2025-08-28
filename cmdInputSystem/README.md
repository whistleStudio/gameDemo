- onLoad时节点刚实例化完，属性初始化完，但 还没进行 UI 对齐/布局。

这时候取到的 node.position / worldPosition 不包含 Widget 偏移。

- 点击事件getUILoaction 和 节点worldPosition是匹配的， 会有极小的偏差，应该是不同计算过程中产生的误差