import { FC } from 'react';
import { helper } from '@/app/utils/helper';
import URLOrText from '../../shared/URLOrText';
import JsonTable from '../JsonTable';
import ImagePreview from '../../shared/ImagePreview';
import CustomPopover from '../../shared/CustomPopover';
import { usePopoverManager } from '@/app/hooks/usePopoverManager';
interface HasInputData {
    has_input?: any;
    label?: any;
    components?: any;
}
const HasInput: FC<HasInputData> = ({ has_input, label, components }) => {
    const source_table = has_input['source_table'];
    const has_expressions = has_input['has_expressions'];
    const has_part = has_input['has_part'];
    const source_url = has_input['source_url'];
    const comment = has_input['comment'];
    const has_characteristic = has_input['has_characteristic'];
    let character = '';
    if (has_characteristic) {
        const number_of_columns = has_characteristic['number_rows'];
        const number_of_rows = has_characteristic['number_columns'];
        if (number_of_columns && number_of_rows) {
            character = `Size: ${number_of_rows} x ${number_of_columns}`;
        }
    }


    let source_url_has_expressions = null;
    let title_has_expressions = null;
    if (has_expressions) {
        source_url_has_expressions = has_expressions['source_url'];
        title_has_expressions = has_expressions['label'];
    }

    const comps: Record<string, string> = {};
    const { activePopover, containerRef, handlePopoverToggle } = usePopoverManager()

    // if (has_part) {
    //     Object.entries(has_part).map(([key, value]) => (
    //         comps[helper.checkType("label", value, true)] = helper.checkType("see_also", value, true)
    //     ))
    // }
    return (
        <div>
            {label && (
                <URLOrText
                    button="Input data"
                    color="#00b050"
                    content={label}
                />
            )}

            {source_url && (
                <URLOrText
                    button={label ? '' : 'Input data'}
                    color="#00b050"
                    content={source_url}
                />
            )}

            {character && (
                <URLOrText
                    button={!label && !source_url ? 'Input data' : ''}
                    color="#00b050"
                    content={character}
                />
            )}

            {comment && (
                <URLOrText
                    button={!label && !source_url && !character ? 'Input data' : ''}
                    color="#00b050"
                    content={comment}
                />
            )}

            {!source_table && has_part && (
                Object.entries(has_part).map(([key, value]) => (
                    helper.filterByStringMatch(components, helper.checkType("label", value, true)).length !== 0 ?
                        <CustomPopover
                            key={`CustomPopover-${key}`}
                            id={`popover-${helper.checkType("label", value, true)}`}
                            subTitle=""
                            title={helper.checkType("label", value, true)}
                            show={activePopover === helper.checkType("label", value, true)}
                            onToggle={(show) => handlePopoverToggle(helper.checkType("label", value, true), show)}
                            trigger={
                                <span key={`CustomPopover-Components-${key}`}>
                                    {key === '0' ? 'Components: ' : ', '}
                                    <span
                                        className="cursor-pointer overlay-trigger me-2 mb-2 font-bold underline"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handlePopoverToggle(helper.checkType("label", value, true), activePopover !== helper.checkType("label", value, true))
                                        }}
                                    >
                                        {helper.checkType("label", value, true)}
                                    </span>
                                </span>
                            }
                        >
                            <div className="inline-block" dangerouslySetInnerHTML={{ __html: `<span class='block'>` + helper.renderIdentifiersComponentList(helper.filterByStringMatch(components, helper.checkType("label", value, true))) + `</span>` }} />
                        </CustomPopover> :
                        (
                            <span key={`no-see_also-${key}`}>
                                {key === '0' ? 'Components: ' : ', '}
                                <span className="overlay-trigger me-2 mb-2 font-bold">
                                    {helper.checkType("label", value, true)}
                                </span>
                            </span>
                        )
                ))
            )}

            {source_table && (
                <JsonTable
                    Components={components}
                    data={source_table}
                    color="#00b050"
                />
            )}
            {has_expressions?.map((type: any) => {
                return <span key={type}>
                    {type['label'] && (<URLOrText color="#00b050" content={type['label'].replace(/\/\//g, "<br>")} />)}
                    <ImagePreview
                        src={type['source_url']}
                        alt=""
                        className="max-w-4xl max-h-[30rem] w-[100%] mx-5 border border-gray-400 my-5 mx-auto rounded"
                    />
                </span>
            })}

        </div>
    );
};

export default HasInput;