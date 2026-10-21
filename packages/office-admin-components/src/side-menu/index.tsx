import { useEffect, useMemo, useState } from 'react';
import { Menu, type MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

export interface SideMenuProps {
  /** antd Menu 的 items，key 用完整路径（如 /system/user） */
  items: MenuProps['items'];
  /** 透传 antd Menu 主题 */
  theme?: 'light' | 'dark';
  /** 点击菜单项时回调；不传则在当前窗口打开该 key 指向的路径 */
  onNavigate?: (key: string) => void;
  /** 手动指定高亮项，默认按当前 location 自动计算 */
  selectedKeys?: string[];
  className?: string;
}

interface MenuNodeLike {
  key?: string | number;
  children?: MenuNodeLike[];
}

/** 把 antd items 摊平，记录每项的祖先 key（用于自动展开父级） */
function flatten(
  nodes: MenuNodeLike[],
  parents: string[] = [],
): Array<{ key: string; parents: string[] }> {
  const result: Array<{ key: string; parents: string[] }> = [];
  for (const node of nodes) {
    if (!node || typeof node.key !== 'string') continue;
    result.push({ key: node.key, parents });
    if (node.children?.length) {
      result.push(...flatten(node.children, [...parents, node.key]));
    }
  }
  return result;
}

/**
 * 侧边菜单：由调用方传入 antd items，选中态与父级展开自动跟随当前路由
 *
 * 不依赖任何状态管理库；如需接管跳转，传 onNavigate 即可
 * （例如用 startTransition 包裹，避免懒加载页面在同步渲染中挂起报错）。
 */
export default function SideMenu({
  items,
  theme = 'light',
  onNavigate,
  selectedKeys,
  className,
}: SideMenuProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const flat = useMemo(() => flatten((items ?? []) as unknown as MenuNodeLike[]), [items]);

  const activeKeys = useMemo(() => {
    if (selectedKeys) return selectedKeys;
    const pathname = location.pathname;
    // 1. 精确命中
    const exact = flat.find((n) => n.key === pathname);
    if (exact) return [exact.key];
    // 2. 详情页 /system/user/1 高亮父级 /system/user：取最长前缀
    const matched = flat
      .filter((n) => pathname.startsWith(`${n.key}/`))
      .sort((a, b) => b.key.length - a.key.length)[0];
    return matched ? [matched.key] : [];
  }, [flat, location.pathname, selectedKeys]);

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // 当前路由变化时，把命中项的祖先目录一并展开
  useEffect(() => {
    const parents = flat.find((n) => n.key === activeKeys[0])?.parents ?? [];
    if (!parents.length) return;
    setOpenKeys((prev) => Array.from(new Set([...prev, ...parents])));
  }, [activeKeys, flat]);

  return (
    <Menu
      mode="inline"
      theme={theme}
      className={className}
      items={items}
      selectedKeys={activeKeys}
      openKeys={openKeys}
      onOpenChange={(keys) => setOpenKeys(keys as string[])}
      onClick={({ key }) => {
        if (key.startsWith('http')) {
          window.open(key, '_blank');
          return;
        }
        if (onNavigate) {
          onNavigate(key);
          return;
        }
        navigate(key);
      }}
      style={{ borderInlineEnd: 'none' }}
    />
  );
}
