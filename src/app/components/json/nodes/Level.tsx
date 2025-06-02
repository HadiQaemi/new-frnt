interface LevelData {
    level?: {
        label: string;
        see_also?: string;
    };
    targets?: {
        label: string;
        see_also?: string;
    };
}

interface StyleProps {
    [key: string]: string | number;
}

import { helper } from '@/app/utils/helper';
import React from 'react';
import URLOrText from '../../shared/URLOrText';
import CustomPopover from '../../shared/CustomPopover';
import { usePopoverManager } from '@/app/hooks/usePopoverManager';

interface LevelProps {
    level: any;
    targets: any;
    components?: any;
}

const Level: React.FC<LevelProps> = ({ level, targets, components }) => {
    const { activePopover, containerRef, handlePopoverToggle } = usePopoverManager()

    return (
        <div className="w-full pt-4">
            <div className="p-2 border-t border-r border-b border-amber-500 border-l-[10px] border-l-amber-500 my-1 relative">
                <span className={`bg-amber-500 absolute -top-[12px] text-[12px] -left-[10px] p-[2px] text-white pl-4 pr-2`}>
                    Setup
                </span>
                {Array.isArray(targets) ? (
                    <div className="flex-grow text-left w-[85%] font-bold" key={`targets-${targets}`}>
                        {targets && `Targets: `}
                        {targets.map((item, index) => (
                            helper.filterByStringMatch(components, item['label']).length ?
                                <CustomPopover
                                    key={`targets-key-${index}`}
                                    id={`popover-targetsText`}
                                    subTitle=""
                                    title={item[1]['label']}
                                    show={activePopover === item[1]['label']}
                                    onToggle={(show) => handlePopoverToggle(item[1]['label'], show)}
                                    trigger={
                                        <span
                                            className="cursor-pointer overlay-trigger me-2 mb-2 font-bold underline"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handlePopoverToggle(item[1]['label'], activePopover !== item[1]['label'])
                                            }}
                                        >
                                            {item['label']}
                                        </span>
                                    }
                                >
                                    <div className="inline-block" dangerouslySetInnerHTML={{
                                        __html: `<span class='block'>` + helper.renderIdentifiersComponentList(
                                            helper.filterByStringMatch(components, item[1]['label'])
                                        ) + `</span>`
                                    }} />
                                </CustomPopover>
                                : (item['label'])
                        ))}
                    </div>
                ) : (
                    <div className="flex-grow text-left w-[85%] font-bold">
                        {`Targets: `}
                        {helper.filterByStringMatch(components, targets['label']).length ? (
                            <CustomPopover
                                id={`popover-targetsText`}
                                subTitle=""
                                title={targets['label']}
                                show={activePopover === targets['label']}
                                onToggle={(show) => handlePopoverToggle(targets['label'], show)}
                                trigger={
                                    <span
                                        className="cursor-pointer overlay-trigger me-2 mb-2 font-bold underline"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handlePopoverToggle(targets['label'], activePopover !== targets['label'])
                                        }}
                                    >
                                        {targets['label']}
                                    </span>
                                }
                            >
                                <div className="inline-block" dangerouslySetInnerHTML={{
                                    __html: `<span class='block'>` + helper.renderIdentifiersComponentList(
                                        helper.filterByStringMatch(components, targets['label'])
                                    ) + `</span>`
                                }} />
                            </CustomPopover>
                        ) : targets['label']}
                    </div>
                )}
                {Array.isArray(level) ? (
                    <div className="flex-grow text-left w-[85%] font-bold" key={`level`}>
                        {`Level: `}
                        {
                            Object.entries(level).map((item, key) => (
                                helper.filterByStringMatch(components, item[1]['label']).length ? (
                                    <CustomPopover
                                        id={`popover-targetsText`}
                                        subTitle=""
                                        title={item[1]['label']}
                                        show={activePopover === item[1]['label']}
                                        onToggle={(show) => handlePopoverToggle(item[1]['label'], show)}
                                        trigger={
                                            <span
                                                className="cursor-pointer overlay-trigger me-2 mb-2 font-bold underline"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handlePopoverToggle(item[1]['label'], activePopover !== item[1]['label'])
                                                }}
                                            >
                                                {item[1]['label']}
                                            </span>
                                        }
                                    >
                                        <div className="inline-block" dangerouslySetInnerHTML={{
                                            __html: `<span class='block'>` + helper.renderIdentifiersComponentList(
                                                helper.filterByStringMatch(components, targets['label'])
                                            ) + `</span>`
                                        }} />
                                    </CustomPopover>
                                ) : `${item[1]['label']}${Object.entries(level).length !== (key + 1) ? ', ' : ''}`
                            ))
                        }
                    </div>
                ) : (
                    <div className="flex-grow text-left w-[85%] font-bold">
                        {level && `Level: `}
                        {level && helper.filterByStringMatch(components, level['label']).length ? (
                            <CustomPopover
                                id={`popover-level`}
                                subTitle=""
                                title={level['label']}
                                show={activePopover === level['label']}
                                onToggle={(show) => handlePopoverToggle(level['label'], show)}
                                trigger={
                                    <span
                                        className="cursor-pointer overlay-trigger me-2 mb-2 font-bold underline"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handlePopoverToggle(level['label'], activePopover !== level['label'])
                                        }}
                                    >
                                        {level['label']}
                                    </span>
                                }
                            >
                                <div className="inline-block" dangerouslySetInnerHTML={{
                                    __html: `<span class='block'>` + helper.renderIdentifiersComponentList(
                                        helper.filterByStringMatch(components, level['label'])
                                    ) + `</span>`
                                }} />
                            </CustomPopover>
                        ) : (level && level['label'])}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Level;