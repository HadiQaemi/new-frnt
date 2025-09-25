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
import { nanoid } from 'nanoid';

interface LevelProps {
    level: any;
    targets: any;
    components?: any;
}

const Level: React.FC<LevelProps> = ({ level, targets, components }) => {
    const { activePopover, containerRef, handlePopoverToggle } = usePopoverManager()

    return (
        <>
            <span className={`bg-[#f1f5f9] relative p-1 text-[12px] text-[#353839] pl-4 w-full inline-block`}>
                Setup
            </span>
            <div className="p-2 border-[#f1f5f9] border-l-[10px] border-l-[#f1f5f9] relative text-[#353839]">
                {Array.isArray(targets) ? (
                    <div className="flex-grow text-left w-[85%] font-bold text-[#353839]" key={`targets-${targets}`}>
                        {targets && `Targets: `}
                        {targets.map((item, index) => (
                            helper.filterByStringMatch(components, item['label']).length ?
                                <CustomPopover
                                    key={`targets-key-${index}`}
                                    id={`popover-targetsText`}
                                    subTitle=""
                                    title={item['label']}
                                    show={activePopover === item['label']}
                                    onToggle={(show) => handlePopoverToggle(item['label'], show)}
                                    trigger={
                                        <span
                                            className="cursor-pointer overlay-trigger mb-2 font-bold underline"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handlePopoverToggle(item['label'], activePopover !== item['label'])
                                            }}
                                        >
                                            {item['label']}
                                        </span>
                                    }
                                >
                                    <div className="inline-block" dangerouslySetInnerHTML={{
                                        __html: `<span class='block'>` + helper.renderIdentifiersComponentList(
                                            helper.filterByStringMatch(components, item['label'])
                                        ) + `</span>`
                                    }} />
                                </CustomPopover>
                                : `${item['label']}${Object.entries(targets).length !== (index + 1) ? ', ' : ''}`
                        ))}
                    </div>
                ) : (
                    <div className="flex-grow text-left w-[85%] font-bold text-[#353839]">
                        {`Targets: `}
                        {helper.filterByStringMatch(components, targets['label']).length ? (
                            <CustomPopover
                                id={`popover-targetsText`}
                                key={`${nanoid()}`}
                                subTitle=""
                                title={targets['label']}
                                show={activePopover === targets['label']}
                                onToggle={(show) => handlePopoverToggle(targets['label'], show)}
                                trigger={
                                    <span
                                        className="cursor-pointer overlay-trigger mb-2 font-bold underline"
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
                                        key={`${nanoid()}`}
                                        subTitle=""
                                        title={item[1]['label']}
                                        show={activePopover === item[1]['label']}
                                        onToggle={(show) => handlePopoverToggle(item[1]['label'], show)}
                                        trigger={
                                            <span
                                                className="cursor-pointer overlay-trigger mb-2 font-bold underline"
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
                                key={`${nanoid()}`}
                                subTitle=""
                                title={level['label']}
                                show={activePopover === level['label']}
                                onToggle={(show) => handlePopoverToggle(level['label'], show)}
                                trigger={
                                    <span
                                        className="cursor-pointer overlay-trigger mb-2 font-bold underline"
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
        </>
    );
};

export default Level;