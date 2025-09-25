import { Dot, User, UserIcon } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { helper } from '@/app/utils/helper';
import { usePopoverManager } from '@/app/hooks/usePopoverManager';
import CustomPopover from '../../shared/CustomPopover';
import URLOrText from '../../shared/URLOrText';
import { styles } from '@/app/utils/styles';
import { Tag } from 'lucide-react';
import { useEffect, useState } from 'react';

const Label = ({
    tooltip,
    onConceptSelect,
    onAuthorSelect,
    renderTooltip,
    parent,
    typeInfo,
    color,
    button,
    toggleNode,
    statement,
    label,
    level
}: LabelProps) => {
    const { activePopover, containerRef, handlePopoverToggle } = usePopoverManager();
    const [concepts, setConcepts] = useState([]);
    const [textLabel, setTextLabel] = useState([]);
    // let support = [];

    useEffect(() => {
        setTextLabel(statement.label)
        setConcepts(statement.concepts)
        const localConcepts = localStorage.getItem('concepts') || '[]'
        if (localConcepts.length) {
            const storedConcepts = JSON.parse(localStorage.getItem('concepts') || '[]');
            const updatedAuthors = [...storedConcepts];
            concepts.forEach((concept: any) => {
                const concept_id = concept.concept_id ? concept.concept_id : concept.id;
                if (!storedConcepts.some((u: any) => u.id === concept_id)) {
                    updatedAuthors.push({
                        id: concept_id,
                        name: concept.label
                    });
                    localStorage.setItem('concepts', JSON.stringify(updatedAuthors));
                }
            });
        }
    }, [statement]);

    if (statement) {

    }
    const renderIdentifiersList = (identifiers: any, item: any = []) => {
        if (typeof identifiers === 'string')
            identifiers = [identifiers]
        return (
            <>
                {Object.values(identifiers).length > 0 && identifiers[0] && <div className="mt-2">See also</div>}
                {Object.values(identifiers).map((id: any, index) => (
                    <div key={index} className="mb-1 py-0 px-3">
                        <a
                            href={id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-[#0d6efd]"
                            onClick={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.closest('.overlay-trigger')) {
                                    e.stopPropagation();
                                    handlePopoverToggle("", false);
                                }
                            }}
                        >
                            {helper.cleanString(id)}
                        </a>
                    </div>
                ))}
            </>
        )
    };

    const renderContent = () => {
        if (tooltip) {
            return (
                <Tooltip>
                    <TooltipTrigger className="rounded">
                        {parent === 'has_part' ? (
                            <URLOrText
                                content={label || ''}
                                button={helper.capitalizeFirstLetter(helper.cleanFirstLetter(typeInfo.name))}
                                styles={styles}
                                color={color}
                            />
                        ) : (
                            label ? (
                                <URLOrText content={label} button={button || ''} styles={{}} color={color} />
                            ) : typeInfo.name
                        )}
                    </TooltipTrigger>
                    <TooltipContent>
                        {renderTooltip}
                    </TooltipContent>
                </Tooltip>
            );
        }

        if (!level) {
            return (
                <div className="flex flex-col p-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h5 onClick={toggleNode} className="group cursor-default text-[#353839] text-[18px] leading-tight mb-2 font-medium flex items-center gap-2">
                                    <span className="flex-1 cursor-pointer">{textLabel}</span>
                                </h5>
                            </TooltipTrigger>
                            <TooltipContent>{renderTooltip}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* <div className="cursor-default">
                        {statement?.authors?.length > 0 && (<User className="me-1 inline" />)}
                        {statement?.authors?.map((item: any, k: any) => (
                            <CustomPopover
                                key={`custom-popover-${k}`}
                                id={`popover-${`${item.name}`}-${k}`}
                                subTitle="Show content for "
                                title={`${item.name}`}
                                show={activePopover === `${item.name}`}
                                onToggle={(show) => handlePopoverToggle(`${item.name}`, show)}
                                icon={UserIcon}
                                onSelect={() => onAuthorSelect?.(item)}
                                trigger={
                                    <span
                                        className="inline-flex underline items-center gap-1 px-1 py-1 mr-2 mb-2 text-sm cursor-pointer overlay-trigger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePopoverToggle(`${item.name}`, activePopover !== `${item.name}`);
                                        }}
                                    >
                                        {`${item.name}`}
                                    </span>
                                }
                            >
                                {item.orcid && renderIdentifiersList(item.orcid)}
                            </CustomPopover>
                        ))}
                    </div> */}

                    <div className="cursor-default text-[#353839]">
                        {concepts && (
                            concepts.map((item: any, k: any) => (
                                <CustomPopover
                                    key={`custom-popover-${k}`}
                                    id={`popover-${item.label}-${k}`}
                                    subTitle="Show content for "
                                    definition={item['definition'] ? item['definition'] : ''}
                                    title={item.label}
                                    show={activePopover === item.label}
                                    onToggle={(show) => handlePopoverToggle(item.label, show)}
                                    icon={Tag}
                                    onSelect={() => onConceptSelect?.(item)}
                                    trigger={
                                        <span
                                            className={`${item.see_also ? 'underline' : ''} underline inline-flex items-center gap-1 px-1 py-1 text-sm cursor-pointer overlay-trigger`}
                                            onClick={(e) => {
                                                e;
                                                handlePopoverToggle(item.label, activePopover !== item.label);
                                            }}
                                        >
                                            {k === 0 && (<Tag className="me-1 inline text-gray-500" />)}
                                            {k > 0 && (<Dot className="inline font-bold text-gray-500" />)}
                                            {item.label}
                                        </span>
                                    }
                                >
                                    {renderIdentifiersList(item.see_also, item)}
                                </CustomPopover>
                            ))
                        )}
                    </div>
                </div >
            );
        }

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="cursor-help font-bold">
                        {label ? helper.capitalizeFirstLetter(label) : typeInfo.name}
                    </TooltipTrigger>
                    <TooltipContent>{renderTooltip}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        <div className="flex flex-col w-full" ref={containerRef}>
            {renderContent()}
        </div>
    );
};

export default Label;